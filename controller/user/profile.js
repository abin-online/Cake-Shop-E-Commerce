const Address = require('../../model/address');
const User = require('../../model/userModel');

module.exports = {
    // Load Profile
    loadProfile: async (req, res) => {
        try {
            const user = req.session.user;
            const id = user._id;
            const userData = await User.findById(id).lean();
            res.render('user/about_me', { userData });
        } catch (error) {
            console.log(error);
            res.status(500).send('Internal Server Error');
        }
    },

    // Manage Addresses
    manageAddress: async (req, res) => {
        try {
            const userData = req.session.user;
            const id = userData._id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 4;
            const skip = (page - 1) * limit;

            // Fetch user addresses and total count concurrently
            const [userAddress, totalAddress] = await Promise.all([
                Address.find({ userId: id }).skip(skip).limit(limit).lean(),
                Address.find({ userId: id }).countDocuments()
            ]);

            const totalPages = Math.ceil(totalAddress / limit);
            const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

            res.render('user/manage_address', {
                currentPage: page,
                totalPages,
                pages,
                userAddress,
                userData
            });
        } catch (error) {
            console.log(error);
            res.status(500).send('Internal Server Error');
        }
    },

    // Add New Address Page
    addNewAddress: (req, res) => {
        try {
            res.render('user/add_new_address');
        } catch (error) {
            console.log(error);
            res.status(500).send('Internal Server Error');
        }
    },

    // Add New Address POST
    addNewAddressPost: async (req, res) => {
        try {
            const userData = req.session.user;
            const id = userData._id;

            const address = new Address({
                userId: id,
                name: req.body.name,
                mobile: req.body.mobile,
                addressLine1: req.body.address1,
                addressLine2: req.body.address2,
                city: req.body.city,
                state: req.body.state,
                pin: req.body.pin,
                is_default: false,
            });

            await address.save();
            res.redirect('/checkout');
        } catch (error) {
            console.log(error);
            res.status(500).send('Internal Server Error');
        }
    },

    // Edit Address Page
    editAddress: async (req, res) => {
        try {
            const id = req.params.id;
            const address = await Address.findById(id).lean();
            res.render('user/editAddress', { address });
        } catch (error) {
            console.log(error);
            res.status(500).send('Internal Server Error');
        }
    },

    // Edit Address POST
    editAddressPost: async (req, res) => {
        try {
            const id = req.params.id;
            await Address.findByIdAndUpdate(id, {
                $set: {
                    name: req.body.name,
                    mobile: req.body.mobile,
                    addressLine1: req.body.address1,
                    addressLine2: req.body.address2,
                    city: req.body.city,
                    state: req.body.state,
                    pin: req.body.pin,
                    is_default: false,
                }
            });
            res.redirect('/addresses');
        } catch (error) {
            console.log(error);
            res.status(500).send('Internal Server Error');
        }
    },

    // Edit User Details Page
    editDetails: (req, res) => {
        try {
            const userData = req.session.user;
            res.render('user/edit_user', { userData });
        } catch (error) {
            console.log(error);
            res.status(500).send('Internal Server Error');
        }
    },

    // Update Edited User Details POST
    updateDetails: async (req, res) => {
        try {
            const id = req.params.id;
            await User.findByIdAndUpdate(id, {
                $set: {
                    name: req.body.name,
                    mobile: req.body.mobile,
                    email: req.body.email,
                }
            });
            res.redirect('/profile');
        } catch (error) {
            console.log(error);
            res.status(500).send('Internal Server Error');
        }
    },

    // Delete Address
    deleteAddress: async (req, res) => {
        try {
            const id = req.params.id;
            await Address.findByIdAndDelete(id);
            res.redirect('/adresses');
        } catch (error) {
            console.log(error);
            res.status(500).send('Internal Server Error');
        }
    }
};
