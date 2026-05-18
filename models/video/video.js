const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({

    // -------------------------
    // CORE VIDEO INFO
    // -------------------------
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },

    // -------------------------
    // STORAGE INFO
    // -------------------------
    url: { type: String, default: ""},
    s3_key: { type: String, default: "", index: true },
    original_filename: { type: String },
    mime_type: { type: String },
    file_size: { type: Number }, // Kept here at the root level

    // -------------------------
    // OWNERSHIP
    // -------------------------
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // -------------------------
    // AUTHENTICITY SYSTEM
    // -------------------------
    authenticity_score: { type: Number, default: 100, min: 0, max: 100 },
    sha256_hash: { type: String, index: true },
    upload_status: {
        type: String,
        enum: ['processing', 'completed', 'failed'],
        default: 'processing'
    },

    // -------------------------
    // FORENSIC METADATA
    // -------------------------
    metadata: {
        // Video stream
        frame_rate: { type: Number, default: 0 },
        bit_rate: { type: Number, default: 0 },
        width: { type: Number, default: 0 },
        height: { type: Number, default: 0 },
        duration_ms: { type: Number, default: 0 },
        frame_count: { type: Number, default: 0 },
        bit_depth: { type: Number, default: 8 },
        resolution_label: { type: String, default: "" },
        aspect_ratio: { type: Number, default: 0 },
        bitrate_per_pixel: { type: Number, default: 0 },
        bits_per_frame: { type: Number, default: 0 },
        is_odd_framerate: { type: Boolean, default: false },

        // Audio stream
        audio_bitrate: { type: Number, default: 0 },
        audio_channels: { type: Number, default: 0 },
        audio_samplerate: { type: Number, default: 0 },
        has_audio: { type: Boolean, default: false },
        av_duration_diff: { type: Number, default: 0 },

        // File-level stats
        overall_bitrate: { type: Number, default: 0 },
        size_per_second: { type: Number, default: 0 },
        
        // Removed the duplicate file_size from here

        // Editing / provenance
        known_editor_in_app: { type: String, default: "" },
        known_editor_in_lib: { type: String, default: "" },
        date_mismatch: { type: Boolean, default: false },

        // Codec analysis
        is_suspicious_codec: { type: Boolean, default: false },
        is_original_codec: { type: Boolean, default: false }
    }
}, { 
    // This entirely replaces the need for the pre('save') hook and manual date fields!
    timestamps: true 
});

module.exports = mongoose.model('Video', videoSchema);