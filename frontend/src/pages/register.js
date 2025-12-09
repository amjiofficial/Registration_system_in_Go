import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const router = useRouter();
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await fetch(`${apiBase}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      setError('Registration failed (email may exist)');
      return;
    }
    router.push('/login');
  };

  return (
    <div style={styles.shell}>
      <form style={styles.card} onSubmit={submit}>
        <h2 style={styles.title}>Create Account</h2>
        <input style={styles.input} placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <input style={styles.input} placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <input style={styles.input} placeholder="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        {error && <p style={styles.error}>{error}</p>}
        <button style={styles.button} type="submit">Register</button>
      </form>
    </div>
  );
}

const styles = {
  shell: { minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f3f4f6' },
  card: { width: '360px', background: '#fff', padding: '28px', borderRadius: '14px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', display: 'grid', gap: '12px' },
  title: { margin: 0, textAlign: 'center' },
  input: { padding: '12px', borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '14px' },
  button: { padding: '12px', background: '#0ea5e9', color: '#fff', borderRadius: '10px', border: 'none', fontWeight: 700, cursor: 'pointer' },
  error: { color: '#b91c1c', margin: 0, fontSize: '14px' },
};
