export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    try {
        const { imageBase64 } = req.body;
        if (!imageBase64) return res.status(400).json({ error: '没有收到图片数据' });

        // 构建发给 ImgBB 的数据体
        const formData = new URLSearchParams();
        formData.append('image', imageBase64);

        // 将 Key 严格拼接在 URL 的 Query 参数中
        const imgbbUrl = `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`;

        const imgbbResponse = await fetch(imgbbUrl, {
            method: 'POST',
            body: formData,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const json = await imgbbResponse.json();
        return res.status(200).json(json);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: '网关中转失败' });
    }
}
