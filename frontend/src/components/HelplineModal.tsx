interface Props {
  isOpen: boolean
  onClose: () => void
  language?: 'en' | 'mr'
}

export function HelplineModal({ isOpen, onClose, language = 'en' }: Props) {
  if (!isOpen) return null

  const contacts = [
    {
      titleEn: 'Campus Security & Main Gate',
      titleMr: 'सुरक्षा विभाग व मुख्य प्रवेशद्वार',
      number: '+91 2423 222862 (Ext 101)',
      descEn: '24x7 security personnel, visitor check, lost & found',
      descMr: '२४ तास सुरक्षा कर्मचारी आणि मदत केंद्र',
      badge: '24x7',
    },
    {
      titleEn: 'First-Aid & Medical Dispensary',
      titleMr: 'आरोग्य केंद्र व रुग्णवाहिका',
      number: '+91 94237 87412',
      descEn: 'On-campus doctor & emergency ambulance on standby',
      descMr: 'कॅम्पस डॉक्टर व तातडीची रुग्णवाहिका',
      badge: 'EMERGENCY',
      badgeColor: '#ef4444',
    },
    {
      titleEn: 'Student Academic Section',
      titleMr: 'विद्यार्थी व शैक्षणिक विभाग',
      number: '02423-222862',
      descEn: 'Admissions, scholarship queries, marksheets, verification',
      descMr: 'प्रवेश, शिष्यवृत्ती आणि गुणपत्रिका कक्ष',
      badge: 'Office Hours',
    },
    {
      titleEn: 'Girls Hostel Rector & Security',
      titleMr: 'मुलींचे वसतिगृह रेक्टर',
      number: '+91 94237 87415',
      descEn: 'Godavari Girls Hostel 24x7 helpline',
      descMr: 'गोदावरी वसतिगृह २४ तास सुरक्षा कक्ष',
      badge: '24x7',
    },
    {
      titleEn: 'Boys Hostel Rector',
      titleMr: 'मुलांचे वसतिगृह रेक्टर',
      number: '+91 94237 87416',
      descEn: 'Sahyadri Boys Hostel in-charge',
      descMr: 'सह्याद्री वसतिगृह सुरक्षा कक्ष',
      badge: '24x7',
    },
    {
      titleEn: 'National Anti-Ragging Helpline',
      titleMr: 'अँटी-रॅगिंग राष्ट्रीय हेल्पलाइन',
      number: '1800-180-5522 (Toll-Free)',
      descEn: 'Strict zero-tolerance campus policy',
      descMr: 'रॅगिंग प्रतिबंधक टोल-फ्री क्रमांक',
      badge: 'TOLL-FREE',
      badgeColor: '#10b981',
    },
  ]

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        background: 'rgba(5, 7, 12, 0.75)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '540px',
          background: 'rgba(15, 23, 42, 0.96)',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          borderRadius: '20px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6), 0 0 35px rgba(239, 68, 68, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px 16px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#f8fafc' }}>
              {language === 'mr' ? 'संजीवनी आपत्कालीन व संपर्क हेल्पलाइन' : 'Sanjivani Campus Helplines'}
            </h2>
            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
              {language === 'mr'
                ? '२४ तास सुरक्षा, आरोग्य आणि विद्यार्थी साहाय्य'
                : '24x7 Security, Medical Assistance & Student Support'}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '15px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Contact list */}
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '60vh', overflowY: 'auto' }}>
          {contacts.map((c, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>
                    {language === 'mr' ? c.titleMr : c.titleEn}
                  </span>
                  <span
                    style={{
                      fontSize: '9px',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '8px',
                      background: c.badgeColor ? `${c.badgeColor}22` : 'rgba(99, 102, 241, 0.2)',
                      color: c.badgeColor || '#a5b4fc',
                      border: `1px solid ${c.badgeColor || 'rgba(99, 102, 241, 0.4)'}`,
                    }}
                  >
                    {c.badge}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  {language === 'mr' ? c.descMr : c.descEn}
                </div>
              </div>

              <a
                href={`tel:${c.number.replace(/[^0-9+]/g, '')}`}
                style={{
                  textDecoration: 'none',
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  color: '#38bdf8',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>📞</span>
                <span>{c.number}</span>
              </a>
            </div>
          ))}
        </div>

        {/* Address Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(0, 0, 0, 0.3)',
            fontSize: '11px',
            color: 'rgba(255, 255, 255, 0.5)',
            textAlign: 'center',
          }}
        >
          Sanjivani College of Engineering, Sahajanandnagar, Post: Shingnapur, Kopargaon - 423603
        </div>
      </div>
    </div>
  )
}
