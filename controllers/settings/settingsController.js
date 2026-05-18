const Settings = require('../../models/settings/settings');
const joi= require('joi');

exports.settings= async (req, res)=>{
    try {
        const settings = await Settings.find({});
        res.json({settings: settings});
    } catch (error) {
        console.error("Error fetching settings:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.updateSettings = async (req, res) => {
    const newSettingSchema = joi.object({
        key: joi.string().required(),
        value: joi.any().required(),
    });

    const { error } = newSettingSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { key, value } = req.body;
    try {
        const updatedSetting = await Settings.findOneAndUpdate({ key }, { key, value }, { new: true });
        if (!updatedSetting) {
            return res.status(404).json({ message: "Setting not found" });
        }
        res.json({ settings: updatedSetting });
    } catch (error) {
        console.error("Error updating setting:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}