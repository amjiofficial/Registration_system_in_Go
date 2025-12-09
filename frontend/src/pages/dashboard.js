import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const [user, setUser] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }
    fetch(`${apiBase}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('unauth');
        return res.json();
      })
      .then(data => setUser({ name: data.name, email: data.email }))
      .catch(() => router.replace('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const logout = () => {
    localStorage.clear();
    router.push('/');
  };

  if (loading) return <p style={styles.center}>Loading...</p>;

  return (
    <div style={styles.shell}>
      <div style={styles.layout}>
        <header style={styles.header}>
          <div>
            <p style={styles.kicker}>Dashboard</p>
            <h2 style={styles.title}>Welcome back, {user.name}</h2>
            <p style={styles.subtitle}>{user.email}</p>
          </div>
          <button style={styles.logout} onClick={logout}>Logout</button>
        </header>

        <section style={styles.cardsRow}>
          <div style={styles.card}>
            <p style={styles.cardLabel}>Status</p>
            <h3 style={styles.cardValue}>Signed in</h3>
            <p style={styles.cardHint}>Your session is active.</p>
          </div>
          <div style={styles.card}>
            <p style={styles.cardLabel}>Account</p>
            <h3 style={styles.cardValue}>{user.name || 'User'}</h3>
            <p style={styles.cardHint}>Email: {user.email}</p>
          </div>
        </section>

        <section style={styles.panel}>
          <h4 style={styles.panelTitle}>Quick actions</h4>
          <div style={styles.actions}>
            <button style={styles.primaryBtn} onClick={() => router.push('/')}>Back to Home</button>
            <button style={styles.secondaryBtn} onClick={logout}>Logout</button>
          </div>
        </section>
      </div>
    </div>
  );
}

const styles = {
  shell: { minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg,#e0f2fe,#fdf2f8)', padding: '24px' },
  layout: { width: '100%', maxWidth: '880px', background: '#fff', borderRadius: '20px', boxShadow: '0 14px 38px rgba(0,0,0,0.08)', padding: '28px', display: 'grid', gap: '20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' },
  kicker: { margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '12px', color: '#0ea5e9', fontWeight: 700 },
  title: { margin: '4px 0', fontSize: '26px' },
  subtitle: { margin: 0, color: '#4b5563' },
  logout: { padding: '10px 14px', background: '#f3f4f6', color: '#111827', borderRadius: '10px', border: '1px solid #e5e7eb', cursor: 'pointer', fontWeight: 600 },
  cardsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' },
  card: { padding: '16px', border: '1px solid #e5e7eb', borderRadius: '14px', background: '#f9fafb' },
  cardLabel: { margin: 0, fontSize: '12px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#6b7280' },
  cardValue: { margin: '6px 0', fontSize: '20px' },
  cardHint: { margin: 0, color: '#6b7280' },
  panel: { padding: '18px', border: '1px solid #e5e7eb', borderRadius: '14px', background: '#fff' },
  panelTitle: { margin: '0 0 12px 0' },
  actions: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  primaryBtn: { padding: '12px 16px', background: '#0ea5e9', color: '#fff', borderRadius: '10px', border: 'none', fontWeight: 700, cursor: 'pointer' },
  secondaryBtn: { padding: '12px 16px', background: '#fff', color: '#0f172a', borderRadius: '10px', border: '1px solid #e5e7eb', fontWeight: 700, cursor: 'pointer' },
  center: { display: 'grid', placeItems: 'center', minHeight: '100vh' },
};
