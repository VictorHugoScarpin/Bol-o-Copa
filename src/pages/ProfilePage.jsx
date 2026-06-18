import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import QuizProfileCard from '../components/QuizProfileCard'

export default function ProfilePage() {
  const { user, profile, signOut, fetchProfile } = useAuth()
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState('')
  const fileRef = useRef()

  async function saveProfile() {
    if (!displayName.trim()) return
    setSaving(true)
    await supabase.from('profiles').update({ display_name: displayName.trim() }).eq('id', user.id)
    await fetchProfile(user.id)
    setMsg('✓ Perfil atualizado!')
    setSaving(false)
    setTimeout(() => setMsg(''), 3000)
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${user.id}/avatar.${ext}`
    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (!uploadError) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', user.id)
      await fetchProfile(user.id)
      setMsg('✓ Foto atualizada!')
      setTimeout(() => setMsg(''), 3000)
    }
    setUploading(false)
  }

  const initials = (profile?.display_name || profile?.nick || '?').slice(0, 2).toUpperCase()

  return (
    <div className="page">
      <div className="section-title">Perfil</div>

      <QuizProfileCard userId={user.id} />

      <div className="glass-card" style={{ padding: '28px 24px', marginBottom: '12px' }}>
        {/* Avatar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <div style={{ position: 'relative' }}>
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt="" style={{ width: 84, height: 84, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--border-strong)' }} />
              : <div style={{ width: 84, height: 84, borderRadius: '50%', background: 'var(--gold-dim)', border: '3px solid rgba(232,184,75,0.30)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '34px', color: 'var(--gold)', letterSpacing: '0.06em' }}>{initials}</div>
            }
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              style={{ position: 'absolute', bottom: -2, right: -2, width: 28, height: 28, borderRadius: '50%', background: 'var(--gold)', border: '2px solid var(--void)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}
            >
              {uploading ? '⟳' : '📷'}
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: '17px', color: 'var(--text)' }}>{profile?.display_name || profile?.nick}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: 2 }}>@{profile?.nick}</div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
          {[
            ['Pontos', profile?.points ?? 0, 'var(--gold)'],
            ['Placares Exatos', profile?.exact_hits ?? 0, 'var(--green)'],
          ].map(([label, value, color]) => (
            <div key={label} style={{ background: 'var(--surface)', borderRadius: 'var(--r-md)', padding: '16px 12px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '34px', color, letterSpacing: '0.04em', lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '5px', fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>

        <div className="divider" />

        <div className="input-group" style={{ marginBottom: '16px', marginTop: '16px' }}>
          <label className="input-label">Nome de exibição</label>
          <input className="input" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Como você quer ser chamado" />
        </div>

        {msg && (
          <div style={{ color: 'var(--green)', fontSize: '13px', textAlign: 'center', marginBottom: '12px', padding: '8px', background: 'var(--green-dim)', borderRadius: 'var(--r-sm)' }}>
            {msg}
          </div>
        )}

        <button className="btn btn-primary" onClick={saveProfile} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </div>

      <button
        className="btn"
        onClick={signOut}
        style={{ color: 'var(--red)', borderColor: 'rgba(240,62,62,0.25)', background: 'var(--red-dim)' }}
      >
        Sair da conta
      </button>
    </div>
  )
}
