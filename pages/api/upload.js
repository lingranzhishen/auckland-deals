export const config = { api: { bodyParser: false } }; // 告诉Next.js这是一个二进制文件流，不要把它当JSON解析

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    try {
        // 1. 以后端身份直接呼叫 ImgBB，由于不是浏览器行为，100% 免疫跨域错误！
        const imgbbResponse = await fetch(`https://imgbb.com{process.env.NEXT_PUBLIC_IMGBB_API_KEY}`, {
            method: 'POST',
            body: req, // 将手机拍照的文件流原封不动传过去
            headers: { 'Content-Type': req.headers['content-type'] }
        });

        const data = await imgbbResponse.json();
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: '后端中转失败' });
    }
}
