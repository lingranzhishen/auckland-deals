import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// 初始化 Supabase 客户端（直接读取之前在 Vercel 绑定的环境变量）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Home() {
    const [deals, setDeals] = useState([]); // 存放从数据库取出来的线报
    const [activeRegion, setActiveRegion] = useState('全奥克兰'); // 当前选中的区域
    const [loading, setLoading] = useState(true);

    const regions = ['全奥克兰', 'Central', 'North Shore', 'East', 'West', 'South'];

    // 联网获取数据的核心函数
    async function fetchDeals() {
        setLoading(true);
        let query = supabase.from('deals').select('*').order('created_at', { ascending: false });

        // 如果选了特定区域（比如北岸），就加一个筛选条件
        if (activeRegion !== '全奥克兰') {
            query = query.eq('region', activeRegion);
        }

        const { data, error } = await query;
        if (error) {
            console.error('读取数据库失败:', error);
        } else {
            setDeals(data || []);
        }
        setLoading(false);
    }

    // 当用户打开网页，或者切换区域按钮时，自动触发联网抓取
    useEffect(() => {
        if (supabaseUrl && supabaseAnonKey) {
            fetchDeals();
        }
    }, [activeRegion]);

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', maxWidth: '600px', margin: '0 auto', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
            <header style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h1 style={{ color: '#ff4d4f', fontSize: '28px', marginBottom: '5px' }}>🇳🇿 奥克兰捡漏网</h1>
                <p style={{ color: '#666', margin: 0 }}>0成本·纯圈粉·奥克兰本地省钱情报站</p>
            </header>

            {/* 奥克兰区域筛选按钮 */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '25px', justifyContent: 'center' }}>
                {regions.map((region) => (
                    <button
                        key={region}
                        onClick={() => setActiveRegion(region)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '20px',
                            border: activeRegion === region ? '1px solid #ff4d4f' : '1px solid #ddd',
                            backgroundColor: activeRegion === region ? '#ff4d4f' : '#fff',
                            color: activeRegion === region ? '#fff' : '#333',
                            cursor: 'pointer',
                            fontWeight: activeRegion === region ? 'bold' : 'normal',
                            transition: 'all 0.2s'
                        }}
                    >
                        {region === '全奥克兰' ? '全奥克兰' : region}
                    </button>
                ))}
            </div>

            {/* 引导加入私域微信群的横幅 */}
            <div style={{ backgroundColor: '#fffbe6', border: '1px solid #ffe58f', padding: '15px', borderRadius: '8px', textAlign: 'center', marginBottom: '20px' }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#d46b08' }}>
                    🔥 手慢无！爆料延迟可能导致错失好机
                </p>
                <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#555' }}>
                    长按加群主微信，拉你进【奥克兰实时捡漏群】
                </p>
            </div>

            {/* 动态线报列表展示 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {loading ? (
                    <p style={{ textAlign: 'center', color: '#999' }}>正在联网搬运奥克兰最新线报...</p>
                ) : deals.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>该区域暂无捡漏线报，快去群里呼唤小伙伴爆料吧！</p>
                ) : (
                    deals.map((deal) => (
                        <div key={deal.id} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '15px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ backgroundColor: '#ff4d4f', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                  {deal.source_type || '特价'}
                </span>
                                <span style={{ color: '#999', fontSize: '11px', marginLeft: 'auto' }}>
                  {new Date(deal.created_at).toLocaleDateString('en-NZ')}
                </span>
                            </div>
                            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#333' }}>{deal.title}</h3>
                            <p style={{ margin: '0 0 12px 0', color: '#666', fontSize: '13px', lineHeight: '1.4' }}>{deal.description}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #eee', paddingTop: '10px' }}>
                <span style={{ color: '#ff4d4f', fontSize: '16px', fontWeight: 'bold' }}>
                  ${deal.deal_price} <span style={{ textDecoration: 'line-through', color: '#bbb', fontSize: '12px', fontWeight: 'normal' }}>${deal.original_price}</span>
                </span>
                                <span style={{ color: '#8c8c8c', fontSize: '11px' }}>
                  📍 {deal.suburb} | {deal.address}
                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
