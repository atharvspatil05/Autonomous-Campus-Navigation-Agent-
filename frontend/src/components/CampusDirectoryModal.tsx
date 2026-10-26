import { useState } from 'react'
import { SANJIVANI_LANDMARKS, type SanjivaniLandmarkInfo } from '../data/sanjivaniLandmarks'
import { useNavigationStore } from '../store/navigationStore'
import { navigationApi } from '../api/navigationApi'

interface Props {
  isOpen: boolean
  onClose: () => void
  language?: 'en' | 'mr'
}

type CategoryTab = 'ALL' | 'ACADEMIC' | 'HOSTEL' | 'FOOD' | 'SPORTS' | 'PARKING' | 'ADMIN' | 'TRANSIT'

const TABS: { id: CategoryTab; labelEn: string; labelMr: string }[] = [
  { id: 'ALL', labelEn: 'All Places', labelMr: 'सर्व ठिकाणे' },
  { id: 'ACADEMIC', labelEn: 'Academic & Labs', labelMr: 'शैक्षणिक विभाग व लॅब्स' },
  { id: 'HOSTEL', labelEn: 'Hostels & Mess', labelMr: 'वसतिगृहे व मेस' },
  { id: 'FOOD', labelEn: 'Dining & Cafes', labelMr: 'कँटीन व खाद्य' },
  { id: 'SPORTS', labelEn: 'Sports & Fitness', labelMr: 'क्रीडा व जिम' },
  { id: 'PARKING', labelEn: 'Parking & Sheds', labelMr: 'वाहनतळ व शेड्स' },
  { id: 'ADMIN', labelEn: 'Admin & Services', labelMr: 'प्रशासन व सेवा' },
  { id: 'TRANSIT', labelEn: 'Gates & Bus', labelMr: 'प्रवेशद्वार व बस' },
]

function getCategoryForLandmark(item: SanjivaniLandmarkInfo): CategoryTab[] {
  const id = item.id
  const categories: CategoryTab[] = []
  if (['boys-hostel', 'girls-hostel', 'hostel-mess', 'rector-residence', 'girls-gym', 'staff-quarters'].includes(id)) {
    categories.push('HOSTEL')
  }
  if (['cafeteria', 'canteen-north', 'hostel-mess'].includes(id)) {
    categories.push('FOOD')
  }
  if (['sports-complex', 'fitness-center', 'indoor-sports', 'girls-gym', 'lawn-tennis-court', 'basketball-ground'].includes(id)) {
    categories.push('SPORTS')
  }
  if (['parking-north', 'parking-sheds', 'accessible-ramp-bay'].includes(id)) {
    categories.push('PARKING')
  }
  if (['main-gate', 'bus-stop', 'atm'].includes(id)) {
    categories.push('TRANSIT')
  }
  if (['admin-block', 'photocopy-center', 'health-center', 'seminar-room', 'fountain', 'banquet-hall', 'staff-quarters'].includes(id)) {
    categories.push('ADMIN')
  }
  if ([
    'cse-dept', 'it-dept', 'ece-dept', 'ee-dept', 'mech-dept', 'mechatronics-dept',
    'civil-dept', 'structural-dept', 'first-year-block', 'mba-dept', 'main-library',
    'digital-library', 'reading-lounges', 'research-block', 'workshop', 'diploma-polytechnic'
  ].includes(id)) {
    categories.push('ACADEMIC')
  }
  return categories.length > 0 ? categories : ['ACADEMIC']
}

export function CampusDirectoryModal({ isOpen, onClose, language = 'en' }: Props) {
  const [activeTab, setActiveTab] = useState<CategoryTab>('ALL')
  const [searchFilter, setSearchFilter] = useState('')

  const {
    originNodeId,
    algorithm,
    accessibleOnly,
    setQuery,
    setResponse,
    setIsNavigating,
    setError,
    clearNavigation,
  } = useNavigationStore()

  if (!isOpen) return null

  const allLandmarks = Object.values(SANJIVANI_LANDMARKS)

  const filteredLandmarks = allLandmarks.filter((item) => {
    const itemCats = getCategoryForLandmark(item)
    const matchesTab = activeTab === 'ALL' || itemCats.includes(activeTab)
    const q = searchFilter.toLowerCase().trim()
    const matchesSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.marathiName.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      (item.highlights && item.highlights.some((h) => h.toLowerCase().includes(q)))
    return matchesTab && matchesSearch
  })

  const handleNavigate = async (landmark: SanjivaniLandmarkInfo) => {
    onClose()
    setQuery(landmark.name)
    clearNavigation()
    setIsNavigating(true)
    setError(null)
    try {
      const res = await navigationApi.navigate({
        natural_language_query: landmark.name,
        origin_node_id: originNodeId,
        preferences: {
          algorithm,
          accessible_only: accessibleOnly,
          avoid_blocked: true,
        },
      })
      setResponse(res)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Navigation failed'
      setError(msg)
    } finally {
      setIsNavigating(false)
    }
  }

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
          maxWidth: '860px',
          maxHeight: '88vh',
          background: 'rgba(15, 23, 42, 0.96)',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          borderRadius: '20px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6), 0 0 35px rgba(99, 102, 241, 0.25)',
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
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src="/sanjivani_logo.png"
              alt="Sanjivani Logo"
              style={{ width: '40px', height: '40px', objectFit: 'contain' }}
              onError={(e) => {
                ;(e.currentTarget as HTMLElement).style.display = 'none'
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#f8fafc' }}>
                  {language === 'mr' ? 'संजीवनी कॅम्पस डिरेक्टरी' : 'Sanjivani Campus Directory'}
                </h2>
                <span style={{ fontSize: '11px', background: 'rgba(99, 102, 241, 0.25)', color: '#a5b4fc', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                  {allLandmarks.length} Locations
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
                {language === 'mr'
                  ? 'सर्व शैक्षणिक विभाग, वसतिगृहे, क्रीडा संकुल आणि सुविधा'
                  : 'Departments, residential hostels, sports, dining & campus facilities'}
              </div>
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

        {/* Search & Tabs */}
        <div style={{ padding: '14px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(0,0,0,0.2)' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <span
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'rgba(255, 255, 255, 0.4)',
                display: 'flex',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              placeholder={
                language === 'mr'
                  ? 'उदा. कॉम्प्युटर, मेकॅनिकल, आयटी, वसतिगृह, जिम, लायब्ररी, कँटीन...'
                  : 'Search e.g. Computer, IT, Mechanical, Girls Hostel, Gym, Reading Lounge...'
              }
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 38px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>

          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
            {TABS.map((tab) => {
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    whiteSpace: 'nowrap',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: '1px solid',
                    borderColor: active ? 'rgba(99, 102, 241, 0.6)' : 'rgba(255, 255, 255, 0.1)',
                    background: active
                      ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.4), rgba(59, 130, 246, 0.3))'
                      : 'rgba(255, 255, 255, 0.04)',
                    color: active ? '#fff' : 'rgba(255, 255, 255, 0.65)',
                    fontSize: '12px',
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {language === 'mr' ? tab.labelMr : tab.labelEn}
                </button>
              )
            })}
          </div>
        </div>

        {/* Directory Cards Grid */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '16px',
          }}
        >
          {filteredLandmarks.map((item) => (
            <div
              key={item.id}
              style={{
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.09)',
                borderRadius: '14px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Thumbnail */}
              <div style={{ position: 'relative', height: '110px', overflow: 'hidden' }}>
                <img
                  src={item.photo}
                  alt={item.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    background: 'rgba(15, 23, 42, 0.85)',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#38bdf8',
                    letterSpacing: '0.04em',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                  }}
                >
                  {item.category}
                </div>
              </div>

              {/* Info */}
              <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc', marginBottom: '2px' }}>
                  {item.name}
                </div>
                <div style={{ fontSize: '12px', color: '#38bdf8', marginBottom: '8px', fontFamily: 'Mukta, sans-serif' }}>
                  {item.marathiName}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: 'rgba(255, 255, 255, 0.65)',
                    lineHeight: 1.4,
                    marginBottom: '10px',
                    flex: 1,
                  }}
                >
                  {language === 'mr' ? item.marathiDescription : item.description}
                </div>

                {item.timing && (
                  <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '10px' }}>
                    🕒 {item.timing}
                  </div>
                )}

                {/* Direct Action */}
                <button
                  type="button"
                  onClick={() => handleNavigate(item)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <span>{language === 'mr' ? 'येथे मार्ग दाखवा' : 'Navigate Here'}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polygon points="3 11 22 2 13 21 11 13 3 11" />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          {filteredLandmarks.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.5)' }}>
              No campus locations found matching "{searchFilter}".
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
