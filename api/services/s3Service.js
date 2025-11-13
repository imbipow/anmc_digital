const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const mime = require('mime-types');
const config = require('../config');

// Configure AWS SDK
AWS.config.update({
    region: config.aws.region,
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey
});

const s3 = new AWS.S3();
const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'anmc-media-dev';

class S3Service {
    /**
     * Upload file to S3
     */
    async uploadFile(file, folder = 'uploads') {
        const fileExtension = mime.extension(file.mimetype) || 'jpg';
        const fileName = `${folder}/${uuidv4()}.${fileExtension}`;

        const params = {
            Bucket: BUCKET_NAME,
            Key: fileName,
            Body: file.buffer,
            ContentType: file.mimetype
        };

        try {
            const result = await s3.upload(params).promise();
            return {
                key: result.Key,
                url: result.Location,
                bucket: result.Bucket,
                etag: result.ETag
            };
        } catch (error) {
            console.error('Error uploading file to S3:', error);
            throw error;
        }
    }

    /**
     * Upload multiple files to S3
     */
    async uploadMultipleFiles(files, folder = 'uploads') {
        const uploadPromises = files.map(file => this.uploadFile(file, folder));
        return await Promise.all(uploadPromises);
    }

    /**
     * Get file from S3
     */
    async getFile(key) {
        const params = {
            Bucket: BUCKET_NAME,
            Key: key
        };

        try {
            const result = await s3.getObject(params).promise();
            return result;
        } catch (error) {
            console.error('Error getting file from S3:', error);
            throw error;
        }
    }

    /**
     * Get signed URL for private file access
     */
    async getSignedUrl(key, expiresIn = 3600) {
        const params = {
            Bucket: BUCKET_NAME,
            Key: key,
            Expires: expiresIn
        };

        try {
            const url = await s3.getSignedUrlPromise('getObject', params);
            return url;
        } catch (error) {
            console.error('Error generating signed URL:', error);
            throw error;
        }
    }

    /**
     * List files in a folder
     */
    async listFiles(folder = '', maxKeys = 1000) {
        const params = {
            Bucket: BUCKET_NAME,
            Prefix: folder,
            MaxKeys: maxKeys
        };

        try {
            const result = await s3.listObjectsV2(params).promise();
            return result.Contents.map(item => ({
                key: item.Key,
                size: item.Size,
                lastModified: item.LastModified,
                etag: item.ETag,
                url: `https://${BUCKET_NAME}.s3.${config.aws.region}.amazonaws.com/${item.Key}`
            }));
        } catch (error) {
            console.error('Error listing files from S3:', error);
            throw error;
        }
    }

    /**
     * Delete file from S3
     */
    async deleteFile(key) {
        const params = {
            Bucket: BUCKET_NAME,
            Key: key
        };

        try {
            await s3.deleteObject(params).promise();
            return { success: true, key };
        } catch (error) {
            console.error('Error deleting file from S3:', error);
            throw error;
        }
    }

    /**
     * Delete multiple files from S3
     */
    async deleteMultipleFiles(keys) {
        const params = {
            Bucket: BUCKET_NAME,
            Delete: {
                Objects: keys.map(key => ({ Key: key })),
                Quiet: false
            }
        };

        try {
            const result = await s3.deleteObjects(params).promise();
            return {
                success: true,
                deleted: result.Deleted,
                errors: result.Errors
            };
        } catch (error) {
            console.error('Error deleting multiple files from S3:', error);
            throw error;
        }
    }

    /**
     * Copy file within S3
     */
    async copyFile(sourceKey, destinationKey) {
        const params = {
            Bucket: BUCKET_NAME,
            CopySource: `/${BUCKET_NAME}/${sourceKey}`,
            Key: destinationKey
        };

        try {
            await s3.copyObject(params).promise();
            return {
                success: true,
                sourceKey,
                destinationKey,
                url: `https://${BUCKET_NAME}.s3.${config.aws.region}.amazonaws.com/${destinationKey}`
            };
        } catch (error) {
            console.error('Error copying file in S3:', error);
            throw error;
        }
    }

    /**
     * Get file metadata
     */
    async getFileMetadata(key) {
        const params = {
            Bucket: BUCKET_NAME,
            Key: key
        };

        try {
            const result = await s3.headObject(params).promise();
            return {
                contentType: result.ContentType,
                contentLength: result.ContentLength,
                lastModified: result.LastModified,
                etag: result.ETag,
                metadata: result.Metadata
            };
        } catch (error) {
            console.error('Error getting file metadata:', error);
            throw error;
        }
    }

    /**
     * Check if file exists
     */
    async fileExists(key) {
        try {
            await this.getFileMetadata(key);
            return true;
        } catch (error) {
            if (error.code === 'NotFound') {
                return false;
            }
            throw error;
        }
    }
}

module.exports = new S3Service();
