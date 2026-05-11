import {
    putObjectAsync,
    deleteObjectAsync
} from "../utils/s3Client.js";

import crypto from "crypto";
import sharp from "sharp";

const publicBucketName = process.env.AWS_S3_BUCKET_NAME || "prod-dokkan";
const awsRegion = process.env.AWS_S3_REGION || "us-east-1";


/**
 * Normalize a string for safe use in object paths.
 * @param {string} name Input value to sanitize.
 * @param {number} [maxLen=63] Maximum output length.
 * @returns {string}
 */
const sanitizer =(name, maxLen = 63) => {
    if (!name) return '';
    let s = String(name).toLowerCase();
    s = s.replace(/[^a-z0-9-]/g, '-');
    s = s.replace(/-+/g, '-'); 
    s = s.replace(/^-|-$/g, '');
    if (s.length > maxLen) s = s.slice(0, maxLen);
    return s;
};


/**
 * Optimize an image buffer and convert it to webp.
 * @param {Buffer} buffer Original image buffer.
 * @returns {Promise<Buffer>}
 */
const optimizedImageBuffer =async(buffer)=> {
    try {
        
            const optimizedBuffer = await sharp(buffer)
            .resize({ width: 800, height: 800, fit: 'inside' })
            .webp({ quality: 80 })
            .toBuffer();
        return optimizedBuffer;

    } catch (error) {
        throw error;
    }

        }

/**
 * Build a deterministic object path for uploaded images.
 * @param {object} params
 * @param {string} params.clientRole User role segment in path.
 * @param {string} params.subFolder Logical subfolder segment in path.
 * @param {string} params.clientEmail User email used to derive owner segment.
 * @param {string} params.fileName Original file name.
 * @returns {string}
 */
const determinePathName=({clientRole,subFolder,clientEmail,fileName})=>{
        const uniqeId= crypto.randomBytes(8).toString('hex');
        


    return `${clientRole}/${subFolder}/${sanitizer(clientEmail.split("@")[0])}/${sanitizer(fileName)}-${uniqeId}.webp`;

}

const encodeObjectPath = (objectName) => objectName.split("/").map(encodeURIComponent).join("/");

const extractObjectNameFromUrl = (imgUrl) => {
    try {
        const parsed = new URL(imgUrl);
        const pathname = decodeURIComponent(parsed.pathname.replace(/^\/+/, ""));

        // Virtual-hosted style: https://<bucket>.s3.<region>.amazonaws.com/<key>
        if (parsed.hostname.startsWith(`${publicBucketName}.`)) {
            return pathname;
        }

        // Path style: https://s3.<region>.amazonaws.com/<bucket>/<key>
        if (pathname.startsWith(`${publicBucketName}/`)) {
            return pathname.slice(publicBucketName.length + 1);
        }

        return pathname;
    } catch {
        const marker = `${publicBucketName}/`;
        const idx = imgUrl.indexOf(marker);
        return idx === -1 ? "" : imgUrl.substring(idx + marker.length);
    }
};

/**
 * Upload an optimized image to the configured public AWS S3 bucket.
 * @param {Express.Multer.File} file Uploaded file from multer.
 * @param {string} clientEmail Email of the uploading user.
 * @param {string} clientRole Role of the uploading user.
 * @param {string} subFolder Folder segment inside the role path.
 * @returns {Promise<string>} Public image URL.
 */
const uploadPublicImg = async (file, clientEmail, clientRole, subFolder) => {
    try {
        if (!(file && clientEmail && clientRole)) throw new Error("Missing required parameters");

        const fileName = file.originalname;
        console.log("Received file for upload:", { fileName, clientEmail, clientRole, subFolder });
        const objectName = determinePathName({ clientRole, subFolder, clientEmail, fileName: fileName });

        const buffer = await optimizedImageBuffer(file.buffer);

        await putObjectAsync({ bucket: publicBucketName, objectName, buffer, size: buffer.length, meta: { ContentType: "image/webp" } });

        const imgUrl = `https://${publicBucketName}.s3.${awsRegion}.amazonaws.com/${encodeObjectPath(objectName)}`;
        return imgUrl;
    }
    catch (err) {
        throw err;
    }

}

/**
 * Delete an object from the configured public AWS S3 bucket using its full URL.
 * @param {string} imgUrl Public URL of the stored image.
 * @returns {Promise<void>}
 */
const deletePublicImg = async (imgUrl) => {
    if (!imgUrl) return;
    const objectName = extractObjectNameFromUrl(imgUrl);

    if (!objectName) {
        console.warn("deletePublicImg: Could not extract object name from URL", imgUrl);
        return;
    }

    await deleteObjectAsync(publicBucketName, objectName);
}

export {
    uploadPublicImg,
    deletePublicImg
};