import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    try {
        const { title, suburb, image_url } = req.body;

        // 1. 终极防御：如果前端数据偶尔丢失，后台用默认词强行兜底，防止数据库NULL报错
        const safeTitle = title || '奥克兰街区清仓好物';
        const safeSuburb = suburb || 'Sunnynook';
        const safeImgUrl = image_url || '';

        // 2. 写入数据库，剔除多余的描述拼接，完全对齐最基础的表结构
        const { data, error } = await supabase.from('deals').insert([
            {
                title: safeTitle,
                suburb: safeSuburb,
                source_type: '随手拍',
                deal_price: 0.00,
                original_price: 0.00,
                address: safeSuburb,
                image_url: safeImgUrl
            }
        ]);

        // 3. 如果数据库报错，直接把错误信息捕获并打印
        if (error) {
            console.error('Supabase 数据库内部拦截:', error);
            return res.status(400).json({ success: false, error: error.message });
        }

        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('系统崩溃捕获:', error);
        return res.status(500).json({ success: false, error: '后台网关遭遇未知故障' });
    }
}
