import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Checkbox from "@mui/material/Checkbox";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import API_CONFIG from '../../config/api';
import MembershipPayment from './MembershipPayment';
import { isValidAustralianPhone, getPhoneValidationError } from '../../utils/phoneValidation';
import './style.scss';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const SignUpPage = () => {
    const navigate = useNavigate();

    // Form state
    const [formData, setFormData] = useState({
        // Personal Information
        firstName: '',
        lastName: '',
        email: '',
        mobile: '',
        gender: '',
        age: '',

        // Membership Selection
        membershipCategory: '', // general or life
        membershipType: '', // single or family

        // Address
        residentialAddress: {
            street: '',
            suburb: '',
            state: '',
            postcode: '',
            country: 'Australia'
        },
        postalAddress: {
            street: '',
            suburb: '',
            state: '',
            postcode: '',
            country: 'Australia'
        },
        sameAsResidential: true,

        // Family Members (for family membership)
        familyMembers: [],

        // Password
        password: '',
        confirmPassword: '',

        // Payment
        paymentType: 'upfront', // upfront or installments
        installmentAmount: '', // For life member installments (minimum $300)

        // Direct Debit Information (for installments)
        directDebit: {
            bsb: '',
            accountName: '',
            accountNumber: '',
            authorityAccepted: false
        },

        // Declaration
        acceptDeclaration: false,

        // Comments
        comments: ''
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const [clientSecret, setClientSecret] = useState('');
    const [membershipFee, setMembershipFee] = useState(0);
    const [memberId, setMemberId] = useState(null);
    const [checkingEmail, setCheckingEmail] = useState(false);

    // Calculate membership fee based on category and type
    const calculateFee = (category, type) => {
        const fees = {
            'general': { 'single': 100, 'family': 200 },
            'life': { 'single': 1000, 'family': 1500 }
        };
        return fees[category]?.[type] || 0;
    };

    // Update membership fee when category or type changes
    React.useEffect(() => {
        if (formData.membershipCategory && formData.membershipType) {
            const fee = calculateFee(formData.membershipCategory, formData.membershipType);
            setMembershipFee(fee);
        }
    }, [formData.membershipCategory, formData.membershipType]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: type === 'checkbox' ? checked : value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Handle same as residential checkbox
    const handleSameAsResidential = (e) => {
        const checked = e.target.checked;
        setFormData(prev => ({
            ...prev,
            sameAsResidential: checked,
            postalAddress: checked ? { ...prev.residentialAddress } : {
                street: '',
                suburb: '',
                state: '',
                postcode: '',
                country: 'Australia'
            }
        }));
    };

    // Add family member
    const addFamilyMember = () => {
        if (formData.familyMembers.length >= 3) {
            toast.warning('Maximum 3 family members allowed');
            return;
        }

        setFormData(prev => ({
            ...prev,
            familyMembers: [
                ...prev.familyMembers,
                {
                    firstName: '',
                    lastName: '',
                    email: '',
                    mobile: '',
                    relationship: '',
                    age: ''
                }
            ]
        }));
    };

    // Remove family member
    const removeFamilyMember = (index) => {
        setFormData(prev => ({
            ...prev,
            familyMembers: prev.familyMembers.filter((_, i) => i !== index)
        }));
    };

    // Handle family member change
    const handleFamilyMemberChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            familyMembers: prev.familyMembers.map((member, i) =>
                i === index ? { ...member, [field]: value } : member
            )
        }));

        // Clear error when user starts typing
        if (field === 'email' && errors[`family${index}Email`]) {
            setErrors(prev => ({ ...prev, [`family${index}Email`]: '' }));
        }
    };

    // Check if email exists in database
    const checkEmailExists = async (email) => {
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            return false;
        }

        try {
            const response = await fetch(API_CONFIG.getURL(API_CONFIG.endpoints.memberCheckEmail(email)));
            const data = await response.json();
            return data.exists;
        } catch (error) {
            console.error('Error checking email:', error);
            return false;
        }
    };

    // Handle email blur - check if email exists
    const handleEmailBlur = async (e) => {
        const email = e.target.value.trim();

        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            return;
        }

        setCheckingEmail(true);
        const exists = await checkEmailExists(email);
        setCheckingEmail(false);

        if (exists) {
            setErrors(prev => ({
                ...prev,
                email: 'This email is already registered. Please use a different email or login.'
            }));
        }
    };

    // Handle family member email blur
    const handleFamilyEmailBlur = async (index, email) => {
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            return;
        }

        const exists = await checkEmailExists(email);

        if (exists) {
            setErrors(prev => ({
                ...prev,
                [`family${index}Email`]: 'This email is already registered. Please use a different email.'
            }));
        }
    };

    // Validate form
    const validateForm = async () => {
        const newErrors = {};

        // Personal Information
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
        else {
            // Check if email already exists
            const emailExists = await checkEmailExists(formData.email);
            if (emailExists) {
                newErrors.email = 'This email is already registered. Please use a different email or login.';
            }
        }

        // Australian phone validation
        const phoneError = getPhoneValidationError(formData.mobile);
        if (phoneError) newErrors.mobile = phoneError;

        if (!formData.gender) newErrors.gender = 'Gender is required';

        // Age validation (must be 18 or above)
        if (!formData.age) newErrors.age = 'Age is required';
        else if (parseInt(formData.age) < 18) newErrors.age = 'You must be at least 18 years old to register';

        // Membership
        if (!formData.membershipCategory) newErrors.membershipCategory = 'Please select membership category';
        if (!formData.membershipType) newErrors.membershipType = 'Please select membership type';

        // Address
        if (!formData.residentialAddress.street.trim()) newErrors.residentialStreet = 'Street address is required';
        if (!formData.residentialAddress.suburb.trim()) newErrors.residentialSuburb = 'Suburb is required';
        if (!formData.residentialAddress.state.trim()) newErrors.residentialState = 'State is required';
        if (!formData.residentialAddress.postcode.trim()) newErrors.residentialPostcode = 'Postcode is required';

        // Family members validation
        if (formData.membershipType === 'family') {
            if (formData.familyMembers.length === 0) {
                newErrors.familyMembers = 'At least one family member is required for family membership';
            } else {
                // Check for duplicate emails within family members
                const familyEmails = formData.familyMembers.map(fm => fm.email?.toLowerCase()).filter(Boolean);
                const duplicates = familyEmails.filter((email, index) => familyEmails.indexOf(email) !== index);

                for (let index = 0; index < formData.familyMembers.length; index++) {
                    const member = formData.familyMembers[index];

                    if (!member.firstName.trim()) newErrors[`family${index}FirstName`] = 'First name required';
                    if (!member.lastName.trim()) newErrors[`family${index}LastName`] = 'Last name required';

                    if (!member.email || !member.email.trim()) {
                        newErrors[`family${index}Email`] = 'Email required';
                    } else if (!/\S+@\S+\.\S+/.test(member.email)) {
                        newErrors[`family${index}Email`] = 'Invalid email format';
                    } else if (member.email.toLowerCase() === formData.email.toLowerCase()) {
                        newErrors[`family${index}Email`] = 'Family member email cannot be the same as main member email';
                    } else if (duplicates.includes(member.email.toLowerCase())) {
                        newErrors[`family${index}Email`] = 'Duplicate email found in family members';
                    } else {
                        // Check if email already exists in database
                        const emailExists = await checkEmailExists(member.email);
                        if (emailExists) {
                            newErrors[`family${index}Email`] = 'This email is already registered. Please use a different email.';
                        }
                    }

                    // Australian phone validation for family members
                    const familyPhoneError = getPhoneValidationError(member.mobile);
                    if (familyPhoneError) newErrors[`family${index}Mobile`] = familyPhoneError;

                    if (!member.relationship) newErrors[`family${index}Relationship`] = 'Relationship required';
                    if (!member.age) newErrors[`family${index}Age`] = 'Age required';
                    else if (parseInt(member.age) < 18) newErrors[`family${index}Age`] = 'Must be 18 or above';
                }
            }
        }

        // Password
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
        else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)) {
            newErrors.password = 'Password must contain uppercase, lowercase, number and special character';
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        // Payment validation for life member installments
        if (formData.membershipCategory === 'life' && formData.paymentType === 'installments') {
            // Validate installment amount (minimum $300)
            if (!formData.installmentAmount) {
                newErrors.installmentAmount = 'Upfront payment amount is required for installments';
            } else if (parseFloat(formData.installmentAmount) < 300) {
                newErrors.installmentAmount = 'Minimum upfront payment is $300';
            } else if (parseFloat(formData.installmentAmount) >= membershipFee) {
                newErrors.installmentAmount = `Upfront payment must be less than total fee ($${membershipFee})`;
            }

            // Validate direct debit fields
            if (!formData.directDebit.bsb.trim()) {
                newErrors.directDebitBsb = 'BSB is required for direct debit';
            } else if (!/^\d{3}-?\d{3}$/.test(formData.directDebit.bsb.trim())) {
                newErrors.directDebitBsb = 'BSB must be 6 digits (format: XXX-XXX or XXXXXX)';
            }

            if (!formData.directDebit.accountName.trim()) {
                newErrors.directDebitAccountName = 'Account name is required for direct debit';
            }

            if (!formData.directDebit.accountNumber.trim()) {
                newErrors.directDebitAccountNumber = 'Account number is required for direct debit';
            } else if (!/^\d{6,10}$/.test(formData.directDebit.accountNumber.trim())) {
                newErrors.directDebitAccountNumber = 'Account number must be 6-10 digits';
            }

            if (!formData.directDebit.authorityAccepted) {
                newErrors.directDebitAuthority = 'You must accept the Direct Debit Authority';
            }
        }

        // Declaration
        if (!formData.acceptDeclaration) {
            newErrors.acceptDeclaration = 'You must accept the declaration';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);

        // Validate form (now async)
        const isValid = await validateForm();
        if (!isValid) {
            setLoading(false);
            toast.error('Please fix the errors in the form');
            // Scroll to first error
            const firstError = document.querySelector('.Mui-error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        try {
            // For upfront payment or installments with upfront amount, create payment intent first
            if (formData.paymentType === 'upfront' || (formData.paymentType === 'installments' && formData.installmentAmount)) {
                // For installments, use the installment amount; for upfront, use full membership fee
                const paymentAmount = formData.paymentType === 'installments'
                    ? parseFloat(formData.installmentAmount)
                    : membershipFee;

                const paymentResponse = await fetch(API_CONFIG.getURL('/stripe/create-payment-intent'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount: paymentAmount,
                        currency: 'aud',
                        metadata: {
                            firstName: formData.firstName,
                            lastName: formData.lastName,
                            email: formData.email,
                            mobile: formData.mobile,
                            membershipCategory: formData.membershipCategory,
                            membershipType: formData.membershipType,
                            paymentType: formData.paymentType,
                            ...(formData.paymentType === 'installments' && {
                                installmentAmount: String(formData.installmentAmount),
                                remainingBalance: String(membershipFee - paymentAmount),
                                directDebitBsb: formData.directDebit.bsb,
                                directDebitAccountName: formData.directDebit.accountName,
                                directDebitAccountNumber: formData.directDebit.accountNumber,
                                directDebitAuthorityAccepted: String(formData.directDebit.authorityAccepted)
                            })
                        }
                    })
                });

                const paymentData = await paymentResponse.json();

                if (!paymentResponse.ok) {
                    if (paymentData.error && paymentData.error.includes('Stripe is not configured')) {
                        toast.error('Payment system is being configured. Please contact administrator.');
                    } else {
                        throw new Error(paymentData.error || 'Failed to create payment intent');
                    }
                    setLoading(false);
                    return;
                }

                setClientSecret(paymentData.clientSecret);
                setShowPayment(true);
            } else {
                // This case shouldn't happen as installments now require upfront payment
                await registerMember();
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error(error.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Register member in database
    const registerMember = async (paymentIntentId = null) => {
        try {
            const memberData = {
                ...formData,
                membershipFee,
                paymentIntentId,
                paymentStatus: paymentIntentId ? 'succeeded' : 'pending'
            };

            const response = await fetch(API_CONFIG.getURL(API_CONFIG.endpoints.memberRegister), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(memberData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            setMemberId(data.member.id);

            // Navigate to success page with member data
            navigate('/registration-success', {
                state: { member: data.member },
                replace: true
            });

            return data.member;
        } catch (error) {
            console.error('Error registering member:', error);
            throw error;
        }
    };

    // Handle successful payment
    const handlePaymentSuccess = async (paymentIntent) => {
        try {
            await registerMember(paymentIntent.id);
        } catch (error) {
            toast.error('Payment succeeded but registration failed. Please contact support.');
        }
    };

    if (showPayment && clientSecret) {
        // Calculate the actual payment amount
        const paymentAmount = formData.paymentType === 'installments'
            ? parseFloat(formData.installmentAmount)
            : membershipFee;

        return (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
                <MembershipPayment
                    clientSecret={clientSecret}
                    formData={formData}
                    membershipFee={paymentAmount}
                    totalMembershipFee={membershipFee}
                    onSuccess={handlePaymentSuccess}
                    onCancel={() => {
                        setShowPayment(false);
                        setClientSecret('');
                    }}
                />
            </Elements>
        );
    }

    return (
        <Grid className="loginWrapper">
            <Grid className="loginForm membershipForm">
                <div className="form-header">
                    <IconButton
                        onClick={() => navigate(-1)}
                        className="back-button"
                        aria-label="Go back"
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <div className="header-text">
                        <h2>ANMC Membership Registration</h2>
                        <p>Join the Australian Nepalese Multicultural Centre</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        {/* Personal Information */}
                        <Grid item xs={12}>
                            <h3 className="section-title">Personal Information</h3>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="First Name *"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                error={!!errors.firstName}
                                helperText={errors.firstName}
                                variant="outlined"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Last Name *"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                error={!!errors.lastName}
                                helperText={errors.lastName}
                                variant="outlined"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Email *"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={handleEmailBlur}
                                error={!!errors.email}
                                helperText={errors.email || (checkingEmail ? 'Checking email...' : '')}
                                variant="outlined"
                                disabled={checkingEmail}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Mobile *"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                                error={!!errors.mobile}
                                helperText={errors.mobile}
                                variant="outlined"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl component="fieldset" error={!!errors.gender}>
                                <FormLabel component="legend">Gender *</FormLabel>
                                <RadioGroup
                                    row
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                >
                                    <FormControlLabel value="male" control={<Radio />} label="Male" />
                                    <FormControlLabel value="female" control={<Radio />} label="Female" />
                                </RadioGroup>
                                {errors.gender && <span className="error-text">{errors.gender}</span>}
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Age *"
                                name="age"
                                type="number"
                                value={formData.age}
                                onChange={handleChange}
                                error={!!errors.age}
                                helperText={errors.age || "Must be 18 or above"}
                                variant="outlined"
                                inputProps={{ min: 18 }}
                            />
                        </Grid>

                        {/* Membership Selection */}
                        <Grid item xs={12}>
                            <h3 className="section-title">Membership Selection</h3>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl component="fieldset" error={!!errors.membershipCategory}>
                                <FormLabel component="legend">Membership Category *</FormLabel>
                                <RadioGroup
                                    name="membershipCategory"
                                    value={formData.membershipCategory}
                                    onChange={handleChange}
                                >
                                    <FormControlLabel
                                        value="general"
                                        control={<Radio />}
                                        label="General Membership"
                                    />
                                    <FormControlLabel
                                        value="life"
                                        control={<Radio />}
                                        label="Life Membership"
                                    />
                                </RadioGroup>
                                {errors.membershipCategory && <span className="error-text">{errors.membershipCategory}</span>}
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl component="fieldset" error={!!errors.membershipType}>
                                <FormLabel component="legend">Membership Type *</FormLabel>
                                <RadioGroup
                                    name="membershipType"
                                    value={formData.membershipType}
                                    onChange={handleChange}
                                >
                                    <FormControlLabel
                                        value="single"
                                        control={<Radio />}
                                        label={`Single ${membershipFee > 0 && formData.membershipType === 'single' ? `($${membershipFee})` : ''}`}
                                    />
                                    <FormControlLabel
                                        value="family"
                                        control={<Radio />}
                                        label={`Family ${membershipFee > 0 && formData.membershipType === 'family' ? `($${membershipFee})` : ''}`}
                                    />
                                </RadioGroup>
                                {errors.membershipType && <span className="error-text">{errors.membershipType}</span>}
                            </FormControl>
                        </Grid>

                        {/* Family Members Section */}
                        {formData.membershipType === 'family' && (
                            <>
                                <Grid item xs={12}>
                                    <h3 className="section-title">Family Members</h3>
                                    <p className="helper-text">Add up to 3 family members. Note: Each family member must be 18 years or above and will be registered as an individual member.</p>
                                    {errors.familyMembers && <span className="error-text">{errors.familyMembers}</span>}
                                </Grid>

                                {formData.familyMembers.map((member, index) => (
                                    <Grid item xs={12} key={index}>
                                        <div className="family-member-card">
                                            <h4>Family Member {index + 1}</h4>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        fullWidth
                                                        label="First Name *"
                                                        value={member.firstName}
                                                        onChange={(e) => handleFamilyMemberChange(index, 'firstName', e.target.value)}
                                                        error={!!errors[`family${index}FirstName`]}
                                                        helperText={errors[`family${index}FirstName`]}
                                                        variant="outlined"
                                                        size="small"
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        fullWidth
                                                        label="Last Name *"
                                                        value={member.lastName}
                                                        onChange={(e) => handleFamilyMemberChange(index, 'lastName', e.target.value)}
                                                        error={!!errors[`family${index}LastName`]}
                                                        helperText={errors[`family${index}LastName`]}
                                                        variant="outlined"
                                                        size="small"
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        fullWidth
                                                        label="Email *"
                                                        type="email"
                                                        value={member.email || ''}
                                                        onChange={(e) => handleFamilyMemberChange(index, 'email', e.target.value)}
                                                        onBlur={(e) => handleFamilyEmailBlur(index, e.target.value)}
                                                        error={!!errors[`family${index}Email`]}
                                                        helperText={errors[`family${index}Email`]}
                                                        variant="outlined"
                                                        size="small"
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        fullWidth
                                                        label="Mobile *"
                                                        value={member.mobile || ''}
                                                        onChange={(e) => handleFamilyMemberChange(index, 'mobile', e.target.value)}
                                                        error={!!errors[`family${index}Mobile`]}
                                                        helperText={errors[`family${index}Mobile`]}
                                                        variant="outlined"
                                                        size="small"
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={4}>
                                                    <FormControl fullWidth size="small" error={!!errors[`family${index}Relationship`]}>
                                                        <InputLabel>Relationship *</InputLabel>
                                                        <Select
                                                            value={member.relationship}
                                                            onChange={(e) => handleFamilyMemberChange(index, 'relationship', e.target.value)}
                                                            label="Relationship *"
                                                        >
                                                            <MenuItem value="spouse">Spouse</MenuItem>
                                                            <MenuItem value="child">Child</MenuItem>
                                                            <MenuItem value="parent">Parent</MenuItem>
                                                            <MenuItem value="sibling">Sibling</MenuItem>
                                                        </Select>
                                                        {errors[`family${index}Relationship`] &&
                                                            <span className="error-text">{errors[`family${index}Relationship`]}</span>
                                                        }
                                                    </FormControl>
                                                </Grid>
                                                <Grid item xs={12} sm={4}>
                                                    <TextField
                                                        fullWidth
                                                        label="Age *"
                                                        type="number"
                                                        value={member.age || ''}
                                                        onChange={(e) => handleFamilyMemberChange(index, 'age', e.target.value)}
                                                        error={!!errors[`family${index}Age`]}
                                                        helperText={errors[`family${index}Age`] || "Must be 18 or above"}
                                                        variant="outlined"
                                                        size="small"
                                                        inputProps={{ min: 18 }}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={4}>
                                                    <Button
                                                        variant="outlined"
                                                        color="error"
                                                        onClick={() => removeFamilyMember(index)}
                                                        fullWidth
                                                    >
                                                        Remove
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        </div>
                                    </Grid>
                                ))}

                                {formData.familyMembers.length < 3 && (
                                    <Grid item xs={12}>
                                        <Button
                                            variant="outlined"
                                            onClick={addFamilyMember}
                                            className="add-family-btn"
                                        >
                                            + Add Family Member
                                        </Button>
                                    </Grid>
                                )}
                            </>
                        )}

                        {/* Address Information */}
                        <Grid item xs={12}>
                            <h3 className="section-title">Residential Address</h3>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Street Address *"
                                name="residentialAddress.street"
                                value={formData.residentialAddress.street}
                                onChange={handleChange}
                                error={!!errors.residentialStreet}
                                helperText={errors.residentialStreet}
                                variant="outlined"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Suburb *"
                                name="residentialAddress.suburb"
                                value={formData.residentialAddress.suburb}
                                onChange={handleChange}
                                error={!!errors.residentialSuburb}
                                helperText={errors.residentialSuburb}
                                variant="outlined"
                            />
                        </Grid>

                        <Grid item xs={12} sm={3}>
                            <TextField
                                fullWidth
                                label="State *"
                                name="residentialAddress.state"
                                value={formData.residentialAddress.state}
                                onChange={handleChange}
                                error={!!errors.residentialState}
                                helperText={errors.residentialState}
                                variant="outlined"
                            />
                        </Grid>

                        <Grid item xs={12} sm={3}>
                            <TextField
                                fullWidth
                                label="Postcode *"
                                name="residentialAddress.postcode"
                                value={formData.residentialAddress.postcode}
                                onChange={handleChange}
                                error={!!errors.residentialPostcode}
                                helperText={errors.residentialPostcode}
                                variant="outlined"
                            />
                        </Grid>

                        {/* Postal Address */}
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={formData.sameAsResidential}
                                        onChange={handleSameAsResidential}
                                    />
                                }
                                label="Postal address same as residential address"
                            />
                        </Grid>

                        {!formData.sameAsResidential && (
                            <>
                                <Grid item xs={12}>
                                    <h3 className="section-title">Postal Address</h3>
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Street Address"
                                        name="postalAddress.street"
                                        value={formData.postalAddress.street}
                                        onChange={handleChange}
                                        variant="outlined"
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Suburb"
                                        name="postalAddress.suburb"
                                        value={formData.postalAddress.suburb}
                                        onChange={handleChange}
                                        variant="outlined"
                                    />
                                </Grid>

                                <Grid item xs={12} sm={3}>
                                    <TextField
                                        fullWidth
                                        label="State"
                                        name="postalAddress.state"
                                        value={formData.postalAddress.state}
                                        onChange={handleChange}
                                        variant="outlined"
                                    />
                                </Grid>

                                <Grid item xs={12} sm={3}>
                                    <TextField
                                        fullWidth
                                        label="Postcode"
                                        name="postalAddress.postcode"
                                        value={formData.postalAddress.postcode}
                                        onChange={handleChange}
                                        variant="outlined"
                                    />
                                </Grid>
                            </>
                        )}

                        {/* Password */}
                        <Grid item xs={12}>
                            <h3 className="section-title">Account Security</h3>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Password *"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                error={!!errors.password}
                                helperText={errors.password || 'Min 8 characters with uppercase, lowercase, number & special character'}
                                variant="outlined"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Confirm Password *"
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                error={!!errors.confirmPassword}
                                helperText={errors.confirmPassword}
                                variant="outlined"
                            />
                        </Grid>

                        {/* Payment Type (only for Life Membership) */}
                        {formData.membershipCategory === 'life' && (
                            <>
                                <Grid item xs={12}>
                                    <h3 className="section-title">Payment Options</h3>
                                </Grid>

                                <Grid item xs={12}>
                                    <FormControl component="fieldset">
                                        <FormLabel component="legend">Payment Type</FormLabel>
                                        <RadioGroup
                                            row
                                            name="paymentType"
                                            value={formData.paymentType}
                                            onChange={handleChange}
                                        >
                                            <FormControlLabel
                                                value="upfront"
                                                control={<Radio />}
                                                label="Upfront Payment"
                                            />
                                            <FormControlLabel
                                                value="installments"
                                                control={<Radio />}
                                                label="Installment Payment (Direct Debit)"
                                            />
                                        </RadioGroup>
                                    </FormControl>
                                </Grid>

                                {/* Installment Payment Fields */}
                                {formData.paymentType === 'installments' && (
                                    <>
                                        <Grid item xs={12}>
                                            <div className="installment-info">
                                                <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
                                                    <strong>Note:</strong> Minimum upfront payment of $300 is required.
                                                    The remaining balance will be automatically debited from your account monthly.
                                                </p>
                                            </div>
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Upfront Payment Amount *"
                                                name="installmentAmount"
                                                type="number"
                                                value={formData.installmentAmount}
                                                onChange={handleChange}
                                                error={!!errors.installmentAmount}
                                                helperText={errors.installmentAmount || `Minimum $300, Maximum $${membershipFee - 1}`}
                                                variant="outlined"
                                                inputProps={{ min: 300, max: membershipFee - 1, step: 1 }}
                                            />
                                        </Grid>

                                        <Grid item xs={12}>
                                            <h4 className="section-subtitle">Direct Debit Details</h4>
                                            <p style={{ color: '#666', fontSize: '13px', marginTop: '5px' }}>
                                                Please provide your bank account details for automatic monthly payments
                                            </p>
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="BSB *"
                                                name="directDebit.bsb"
                                                value={formData.directDebit.bsb}
                                                onChange={handleChange}
                                                error={!!errors.directDebitBsb}
                                                helperText={errors.directDebitBsb || 'Format: XXX-XXX or XXXXXX'}
                                                variant="outlined"
                                                placeholder="012-345"
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Account Number *"
                                                name="directDebit.accountNumber"
                                                value={formData.directDebit.accountNumber}
                                                onChange={handleChange}
                                                error={!!errors.directDebitAccountNumber}
                                                helperText={errors.directDebitAccountNumber || '6-10 digits'}
                                                variant="outlined"
                                                placeholder="12345678"
                                            />
                                        </Grid>

                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Account Name *"
                                                name="directDebit.accountName"
                                                value={formData.directDebit.accountName}
                                                onChange={handleChange}
                                                error={!!errors.directDebitAccountName}
                                                helperText={errors.directDebitAccountName || 'Name as shown on bank account'}
                                                variant="outlined"
                                                placeholder="John Smith"
                                            />
                                        </Grid>

                                        <Grid item xs={12}>
                                            <div style={{
                                                backgroundColor: '#f5f5f5',
                                                padding: '15px',
                                                borderRadius: '5px',
                                                border: errors.directDebitAuthority ? '1px solid #d32f2f' : '1px solid #ddd'
                                            }}>
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={formData.directDebit.authorityAccepted}
                                                            onChange={handleChange}
                                                            name="directDebit.authorityAccepted"
                                                        />
                                                    }
                                                    label={
                                                        <span style={{ fontSize: '14px' }}>
                                                            <strong>Direct Debit Authority *</strong><br/>
                                                            I/We authorize ANMC to arrange for funds to be debited from my/our account
                                                            through the Bulk Electronic Clearing System (BECS) in accordance with this request.
                                                            I/We acknowledge that monthly installments will be automatically deducted until
                                                            the full membership fee is paid. I/We understand that I/we can cancel this
                                                            authority by giving ANMC 14 days written notice.
                                                        </span>
                                                    }
                                                />
                                                {errors.directDebitAuthority &&
                                                    <div className="error-text" style={{ marginTop: '10px' }}>
                                                        {errors.directDebitAuthority}
                                                    </div>
                                                }
                                            </div>
                                        </Grid>
                                    </>
                                )}
                            </>
                        )}

                        {/* Comments */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Comments (Optional)"
                                name="comments"
                                value={formData.comments}
                                onChange={handleChange}
                                variant="outlined"
                                multiline
                                rows={3}
                            />
                        </Grid>

                        {/* Declaration */}
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={formData.acceptDeclaration}
                                        onChange={handleChange}
                                        name="acceptDeclaration"
                                    />
                                }
                                label={
                                    <span>
                                        I declare that the information provided is true and correct.
                                        I agree to abide by the ANMC constitution and rules. *
                                    </span>
                                }
                            />
                            {errors.acceptDeclaration &&
                                <div className="error-text">{errors.acceptDeclaration}</div>
                            }
                        </Grid>

                        {/* Membership Fee Display */}
                        {membershipFee > 0 && (
                            <Grid item xs={12}>
                                <div className="fee-display">
                                    {formData.paymentType === 'installments' ? (
                                        <>
                                            <h4>Total Membership Fee: ${membershipFee} AUD</h4>
                                            <p className="helper-text" style={{ marginTop: '10px' }}>
                                                <strong>Upfront Payment:</strong> ${formData.installmentAmount || 0} AUD<br/>
                                                <strong>Remaining Balance:</strong> ${formData.installmentAmount ? membershipFee - parseFloat(formData.installmentAmount) : membershipFee} AUD (via Direct Debit)
                                            </p>
                                        </>
                                    ) : (
                                        <h4>Membership Fee: ${membershipFee} AUD</h4>
                                    )}
                                </div>
                            </Grid>
                        )}

                        {/* Submit Button */}
                        <Grid item xs={12}>
                            <Button
                                fullWidth
                                className="cBtn cBtnLarge cBtnTheme"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Processing...' :
                                 formData.paymentType === 'installments'
                                    ? `Pay Upfront $${formData.installmentAmount || 0}`
                                    : 'Proceed to Payment'}
                            </Button>
                        </Grid>

                        <Grid item xs={12}>
                            <p className="noteHelp">
                                Already have an account? <Link to="/login">Sign In</Link>
                            </p>
                        </Grid>
                    </Grid>
                </form>

                <div className="shape-img">
                    <i className="fi flaticon-honeycomb"></i>
                </div>
            </Grid>
        </Grid>
    );
};

export default SignUpPage;
