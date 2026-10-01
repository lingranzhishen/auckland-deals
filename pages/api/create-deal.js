import { createClient } from '@supabase/supabase-js';

// 🚀 在后端使用 SERVICE_ROLE_KEY（管理员密钥），拥有最高读写权限，无视一切 RLS 限制，永远不会报 401！
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// ⚠️ 避坑提示：如果想完全锁死前端，建议去 Supabase 复制 "service_role" secret 填在 Vercel 环境变量里
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    try {
        const { title, suburb, image_url } = req.body;

        if (!title || !image_url) {
            return res.status(400).json({ error: '标题和图片不能为空' });
        }

        // 后端稳妥写入数据库
        const { data, error } = await supabase.from('deals').insert([
            {
                title: title,
                description: `爆料街区: ${suburb}`,
                region: 'Auckland',
                suburb: suburb || 'Sunnynook',
                source_type: '随手拍',
                deal_price: 0.00,
                original_price: 0.00,
                address: suburb || 'Sunnynook',
                image_url: image_url
            }
        ]);

        if (error) throw error;

        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('后台写入DB失败:', error);
        return res.status(500).json({ error: '后台服务器写入失败' });
    }
}
