import React from 'react';

export default function Home() {
    const regions = ['全奥克兰', '中区 Central', '北岸 North Shore', '东区 East', '西区 West', '南区 South'];

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <header style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h1 style={{ color: '#ff4d4f', fontSize: '28px' }}>🇳🇿 奥克兰捡漏网</h1>
                <p style={{ color: '#666' }}>0成本·纯圈粉·奥克兰本地省钱情报站</p>
            </header>

            {/* 奥克兰区域筛选按钮 */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '25px', justifyContent: 'center' }}>
                {regions.map((region) => (
                    <button key={region} style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid #ddd', backgroundColor: '#fff', cursor: 'pointer' }}>
                        {region}
                    </button>
                ))}
            </div>

            {/* 引导加入私域微信群的横幅 */}
            <div style={{ backgroundColor: '#fffbe6', border: '1px solid #ffe58f', padding: '15px', borderRadius: '8px', textAlign: 'center', marginBottom: '20px' }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#d46b08' }}>
                    🔥 手慢无！优质线报转瞬即逝
                </p>
                <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#555' }}>
                    长按加群主微信，拉你进【奥克兰实时捡漏群】
                </p>
            </div>

            {/* 静态线报占位符 */}
            <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '15px', marginBottom: '15px' }}>
                <span style={{ backgroundColor: '#ff4d4f', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>超市黄标</span>
                <h3 style={{ margin: '10px 0 5px 0' }}>Countdown Albany 临期肉类2折大清仓</h3>
                <p style={{ margin: 0, color: '#999', fontSize: '12px' }}>区域：北岸 North Shore | 价格：$5一盒（原价$22）</p>
            </div>
        </div>
    );
}
