import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Home() {
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [title, setTitle] = useState('');
    const [suburb, setSuburb] = useState('');
    const [uploadingImg, setUploadingImg] = useState(false);
    const [uploadedImgUrl, setUploadedImgUrl] = useState('');
    const [showForm, setShowForm] = useState(false);

    async function fetchDeals() {
        setLoading(true);
        const { data } = await supabase.from('deals').select('*').order('created_at', { ascending: false });
        setDeals(data || []);
        setLoading(false);
    }

    useEffect(() => {
        if (supabaseUrl && supabaseAnonKey) fetchDeals();
    }, []);

    const handleGetLocation = () => {
        if (!navigator.geolocation) return alert('浏览器不支持GPS');
        setSuburb('正在精确定位街区...');
        navigator.geolocation.getCurrentPosition(async (pos) => {
            try {
                const res = await fetch(`https://openstreetmap.org{pos.coords.latitude}&lon=${pos.coords.longitude}&zoom=18`);
                const json = await res.json();
                setSuburb(json.address.suburb || json.address.neighbourhood || json.address.city_district || 'Sunnynook');
            } catch (e) {
                setSuburb('Sunnynook');
            }
        }, () => alert('定位失败，请检查手机定位权限'));
    };

    const handleImageUpload = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploadingImg(true);
        const file = files[0]; // 明确抓取第一张照片

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
            // 核心修复：安全抓取无头部信息的纯粹 Base64 字符串
            const base64Data = reader.result.split(',')[1];

            try {
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ imageBase64: base64Data })
                });
                const json = await res.json();

                // 3. 完美对应你发出的官方响应格式：如果 success 为 true，抓取 data.url
                if (json.success && json.data && json.data.url) {
                    setUploadedImgUrl(json.data.url);
                } else {
                    alert('图床拒绝了这张照片，请重新拍摄');
                }
            } catch (err) {
                alert('连接中转网关失败');
            } finally {
                setUploadingImg(false);
            }
        };
    };

    const handleSubmitDeal = async (e) => {
        e.preventDefault();
        if (!title || !uploadedImgUrl) return alert('请拍照并填写标题！');
        const { error } = await supabase.from('deals').insert([{
            title, suburb: suburb || 'Auckland', source_type: '随手拍', deal_price: 0, original_price: 0, address: suburb, image_url: uploadedImgUrl
        }]);
        if (!error) {
            alert('🎉 爆料成功！已同步全奥克兰！');
            setTitle(''); setUploadedImgUrl(''); setSuburb(''); setShowForm(false); fetchDeals();
        }
    };

    const filteredDeals = deals.filter(d => `${d.title} ${d.suburb}`.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div style={{ fontFamily: 'Arial,sans-serif', padding: '15px', maxWidth: '500px', margin: '0 auto', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <div>
                    <h1 style={{ color: '#ff4d4f', fontSize: '24px', margin: 0 }}>🇳🇿 奥克兰捡漏网</h1>
                    <p style={{ color: '#999', margin: 0, fontSize: '11px' }}>精准街区检索 · 随手拍清仓</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} style={{ backgroundColor: '#ff4d4f', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}>
                    {showForm ? '关闭' : '📢 我要爆料'}
                </button>
            </header>

            <div style={{ marginBottom: '20px' }}>
                <input type="text" placeholder="🔍 输入奥克兰街区筛选 (例如: Sunnynook 或 Albany)" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '12px 15px', boxSizing: 'border-box', border: '2px solid #ff4d4f', borderRadius: '25px', fontSize: '14px', outline: 'none' }} />
            </div>

            {showForm && (
                <form onSubmit={handleSubmitDeal} style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
                    <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>📷 极速随手拍爆料</h3>
                    <div style={{ marginBottom: '12px' }}>
                        <button type="button" onClick={handleGetLocation} style={{ width: '100%', padding: '10px', backgroundColor: '#e6f7ff', border: '1px solid #91d5ff', color: '#1890ff', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>📍 1. 点击自动GPS识别街区</button>
                        {suburb && <input type="text" value={suburb} onChange={(e) => setSuburb(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px' }} />}
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', width: '100%', padding: '20px 0', backgroundColor: '#f5f5f5', border: '2px dashed #ccc', borderRadius: '6px', textAlign: 'center', cursor: 'pointer', fontWeight: 'bold' }}>
                            📸 {uploadingImg ? '正在极速上传图床...' : '2. 调起手机相机拍照'}
                            <input type="file" accept="image/*" capture="camera" onChange={handleImageUpload} style={{ display: 'none' }} />
                        </label>
                        {uploadedImgUrl && <div style={{ marginTop: '10px', textAlign: 'center' }}><img src={uploadedImgUrl} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px' }} /></div>}
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <input type="text" placeholder="3. 简单写个标题（如: Sunnynook华人超市零食清仓）" value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '6px' }} />
                    </div>
                    <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#52c41a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>🚀 发布线报，同步全城！</button>
                </form>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {loading ? ( <p style={{ textAlign: 'center', color: '#999' }}>加载奥克兰情报中...</p> ) : filteredDeals.length === 0 ? ( <p style={{ textAlign: 'center', color: '#999', padding: '30px 0' }}>没有找到该街区的捡漏信息！</p> ) : (
                    filteredDeals.map((deal) => (
                        <div key={deal.id} style={{ border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                            {deal.image_url && <img src={deal.image_url} alt="deal" style={{ width: '100%', maxHeight: '250px', objectFit: 'cover' }} />}
                            <div style={{ padding: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                                    <span style={{ backgroundColor: '#ff4d4f', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>{deal.source_type}</span>
                                    <span style={{ backgroundColor: '#1890ff', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>🏡 {deal.suburb}</span>
                                </div>
                                <h3 style={{ margin: '8px 0 4px 0', fontSize: '15px', color: '#333' }}>{deal.title}</h3>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
