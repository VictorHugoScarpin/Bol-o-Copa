import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

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
    setMsg('Perfil atualizado!')
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
      setMsg('Foto atualizada!')
      setTimeout(() => setMsg(''), 3000)
    }
    setUploading(false)
  }

  const initials = (profile?.display_name || profile?.nick || '?').slice(0, 2).toUpperCase()

  return (
    <div className="page">
      <div className="section-title">Perfil</div>

      <div className="glass-card" style={{ padding: '24px', marginBottom: '16px' }}>
        {/* Avatar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ position: 'relative' }}>
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt="" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-glass-strong)' }} />
              : <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(212,168,50,0.15)', border: '2px solid var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '32px', color: 'var(--accent-gold)' }}>{initials}</div>
            }
            <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ position: 'absolute', bottom: -4, right: -4, width: 26, height: 26, borderRadius: '50%', background: 'var(--accent-gold)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>
              {uploading ? '⟳' : '📷'}
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 600, fontSize: '16px' }}>{profile?.display_name || profile?.nick}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>@{profile?.nick}</div>
          </div>
        </div>

        <div style={{ height: 1, background: 'var(--border-glass)', margin: '0 0 20px' }} />

        {/* Pontos */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
          {[['Pontos', profile?.points || 0, 'var(--accent-gold)'], ['Placares Exatos', profile?.exact_hits || 0, 'var(--green)']].map(([label, value, color]) => (
            <div key={label} style={{ background: 'var(--bg-glass)', borderRadius: '10px', padding: '14px 10px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '30px', color, letterSpacing: '0.04em' }}>{value}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '4px' }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ height: 1, background: 'var(--border-glass)', margin: '0 0 20px' }} />

        <div className="input-group" style={{ marginBottom: '16px' }}>
          <label className="input-label">Nome de exibição</label>
          <input className="input" value={displayName} onChange={e => setDisplayName(e.target.value)} />
        </div>

        {msg && <div style={{ color: 'var(--green)', fontSize: '13px', textAlign: 'center', marginBottom: '12px' }}>{msg}</div>}

        <button className="btn btn-primary" onClick={saveProfile} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </div>

      <button className="btn" onClick={signOut} style={{ color: 'var(--red)', borderColor: 'rgba(239,68,68,0.3)' }}>
        Sair da conta
      </button>
    </div>
  )
}
