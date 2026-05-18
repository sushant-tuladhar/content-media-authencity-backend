const ffmpeg = require('fluent-ffmpeg');
const ffprobeStatic = require('ffprobe-static');

// Set the path to the static ffprobe binary so it doesn't rely on the host system
ffmpeg.setFfprobePath(ffprobeStatic.path);

const extractVideoMetadata = (filePath) => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) {
                return reject(new Error('Failed to extract metadata: ' + err.message));
            }

            const videoStream = metadata.streams.find(s => s.codec_type === 'video');
            const audioStream = metadata.streams.find(s => s.codec_type === 'audio');
            const format = metadata.format;

            if (!videoStream) {
                return reject(new Error('No video stream found in the file.'));
            }

            // Extract basic fields
            const width = videoStream.width || 0;
            const height = videoStream.height || 0;
            const frame_rate_str = videoStream.r_frame_rate || "0/1";
            let frame_rate = 0;
            if (frame_rate_str.includes('/')) {
                const [num, den] = frame_rate_str.split('/').map(Number);
                frame_rate = den ? (num / den) : 0;
            } else {
                frame_rate = parseFloat(frame_rate_str);
            }
            
            const bit_rate = parseInt(format.bit_rate || 0, 10);
            const duration_ms = format.duration ? parseFloat(format.duration) * 1000 : 0;
            const frame_count = videoStream.nb_frames 
                ? parseInt(videoStream.nb_frames, 10) 
                : (frame_rate > 0 && format.duration ? Math.round(frame_rate * parseFloat(format.duration)) : 0);
            const bit_depth = videoStream.bits_per_raw_sample ? parseInt(videoStream.bits_per_raw_sample, 10) : 8;
            
            const aspect_ratio = height > 0 ? (width / height) : 0;
            const pixels = width * height;
            const bitrate_per_pixel = pixels ? (bit_rate / pixels) : 0;
            const bits_per_frame = frame_rate > 0 ? (bit_rate / frame_rate) : 0;
            const is_odd_framerate = frame_rate > 0 && !Number.isInteger(frame_rate);
            
            // Audio Stream
            const has_audio = !!audioStream;
            const audio_bitrate = has_audio && audioStream.bit_rate ? parseInt(audioStream.bit_rate, 10) : 0;
            const audio_channels = has_audio && audioStream.channels ? parseInt(audioStream.channels, 10) : 0;
            const audio_samplerate = has_audio && audioStream.sample_rate ? parseInt(audioStream.sample_rate, 10) : 0;
            
            // Duration Diff
            const v_duration = parseFloat(format.duration || 0);
            const a_duration = v_duration;
            const av_duration_diff = Math.abs(v_duration - a_duration) * 1000;

            // File level
            const overall_bitrate = format.bit_rate ? parseInt(format.bit_rate, 10) : 0;
            const file_size = format.size ? parseInt(format.size, 10) : 0;
            const size_per_second = (format.duration && format.duration > 0) ? (file_size / format.duration) : 0;
            
            // Custom Heuristics for editors/codecs
            const tags = format.tags || {};
            const encoder = (tags.encoder || "").toLowerCase();
            let known_editor_in_app = "";
            if (encoder.includes("premiere")) known_editor_in_app = "Premiere Pro";
            else if (encoder.includes("davinci")) known_editor_in_app = "DaVinci Resolve";
            else if (encoder.includes("capcut")) known_editor_in_app = "CapCut";
            else if (encoder.includes("final cut")) known_editor_in_app = "Final Cut Pro";

            const known_editor_in_lib = encoder.includes("lavf") ? "FFmpeg/Lavf" : "";
            const date_mismatch = false; // Could compare creation_time vs actual date if needed
            
            const codec_name = (videoStream.codec_name || "").toLowerCase();
            const known_codecs = new Set(["h264", "hevc", "av1", "vp9", "vp8", "mpeg4", "prores"]);
            const is_suspicious_codec = !known_codecs.has(codec_name);
            const is_original_codec = ["h264", "hevc"].includes(codec_name);

            resolve({
                frame_rate,
                bit_rate,
                width,
                height,
                duration_ms,
                frame_count,
                bit_depth,
                resolution_label: width + "x" + height,
                aspect_ratio,
                bitrate_per_pixel,
                bits_per_frame,
                is_odd_framerate,
                audio_bitrate,
                audio_channels,
                audio_samplerate,
                has_audio,
                av_duration_diff,
                overall_bitrate,
                size_per_second,
                known_editor_in_app,
                known_editor_in_lib,
                date_mismatch,
                is_suspicious_codec,
                is_original_codec
            });
        });
    });
};

module.exports = { extractVideoMetadata };