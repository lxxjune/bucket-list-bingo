import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Bucket List Bingo - 버킷리스트 빙고 만들기'
export const size = {
    width: 1200,
    height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: 'linear-gradient(to bottom right, #ffffff, #f3f4f6)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'sans-serif',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '4px solid #000',
                        padding: '40px 80px',
                        backgroundColor: '#fff',
                        borderRadius: '20px',
                        boxShadow: '10px 10px 0px 0px rgba(0,0,0,1)',
                    }}
                >
                    <h1
                        style={{
                            fontSize: '60px',
                            fontWeight: 900,
                            margin: '0 0 20px 0',
                            color: '#1A1C20',
                            textAlign: 'center',
                        }}
                    >
                        Bucket List Bingo
                    </h1>
                    <p
                        style={{
                            fontSize: '30px',
                            color: '#4B5563',
                            margin: 0,
                            textAlign: 'center',
                            fontWeight: 600,
                        }}
                    >
                        버킷리스트 빙고 만들기
                    </p>
                </div>
                <div
                    style={{
                        marginTop: '40px',
                        fontSize: '24px',
                        color: '#9CA3AF',
                        fontWeight: 500,
                    }}
                >
                    www.bucketlist.design
                </div>
            </div>
        ),
        {
            ...size,
        }
    )
}
