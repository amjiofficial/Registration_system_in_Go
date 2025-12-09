import Link from 'next/link';

export default function Home() {
  return (
    <div style={styles.shell}>
      <div style={styles.card}>
        <h1 style={styles.title}>Registration Portal</h1>
        <p style={styles.subtitle}>Welcome, choose an action</p>
        <div style={styles.actions}>
          <Link href="/register" style={styles.button}>Register</Link>
          <Link href="/login" style={styles.buttonSecondary}>Login</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  shell: { minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'radial-gradient(circle at 20% 20%, #e0f7ff, #f7f7ff)' },
  card: { padding: '32px', background: '#fff', borderRadius: '16px', boxShadow: '0 12px 40px rgba(0,0,0,0.08)', width: '360px', textAlign: 'center' },
  title: { margin: 0, fontSize: '28px' },
  subtitle: { marginTop: '8px', color: '#555' },
  actions: { display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'center' },
  button: { padding: '12px 18px', background: '#0ea5e9', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontWeight: 600 },
  buttonSecondary: { padding: '12px 18px', background: '#1f2937', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontWeight: 600 }
};
