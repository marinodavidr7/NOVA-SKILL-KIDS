import { getChild } from "@/lib/actions/children";
import { getCentroSettings, getEvalTemplates } from "@/lib/actions/settings";
import PrintButton from "./PrintButton";
import { notFound } from "next/navigation";

export default async function ChildReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const childId = parseInt(id);
  
  const [data, centro, templates] = await Promise.all([
    getChild(childId),
    getCentroSettings(),
    getEvalTemplates()
  ]);

  if (!data) return notFound();

  const birthDate = data.dateOfBirth instanceof Date ? data.dateOfBirth : new Date(data.dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;

  const statusMap: Record<string, string> = { active: 'Activo', suspended: 'Suspendido', graduated: 'Egresado' };
  const genderMap: Record<string, string> = { male: 'Masculino', female: 'Femenino' };
  const tutor = data.parents?.[0];
  const notes = data.medical?.notes || '';
  const bloodType = notes.match(/Tipo de Sangre:\s*(.+)/)?.[1]?.trim() || 'No especificado';
  const authorizedPeople = notes.match(/Personas Autorizadas para Recogida:\s*(.+)/)?.[1]?.trim() || 'Solo tutores';
  const emergencyContact = notes.match(/Contacto de Emergencia Alterno:\s*(.+)/)?.[1]?.trim() || 'No registrado';
  const dateStr = today.toLocaleDateString('es-DO', { year: 'numeric', month: 'long', day: 'numeric' });
  const birthStr = birthDate.toLocaleDateString('es-DO', { year: 'numeric', month: 'long', day: 'numeric' });

  const latestEvaluation = data.evaluations && data.evaluations.length > 0 ? data.evaluations[0] : null;
  const evalScores: Record<string, number> = {};
  if (latestEvaluation && latestEvaluation.results) {
    try {
      const parsed = typeof latestEvaluation.results === 'string' ? JSON.parse(latestEvaluation.results) : latestEvaluation.results;
      templates.forEach((area: any) => {
        const areaRes = parsed[area.id];
        if (areaRes) {
          const indicators = Object.values(areaRes);
          const total = indicators.length;
          if (total > 0) {
            let score = 0;
            indicators.forEach((val) => {
              if (val === 'Logrado') score += 100;
              if (val === 'En Proceso') score += 50;
            });
            evalScores[area.name] = Math.round(score / total);
          }
        }
      });
    } catch (e) {}
  }

  return (
    <div id="rr">
      {/* ── TOOLBAR ── */}
      <div id="toolbar">
        <a href={`/children/${childId}`} id="tb-back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Volver al Expediente
        </a>
        <PrintButton />
      </div>

      {/* ── PAPER ── */}
      <div id="paper-bg">
        <div id="paper">

          {/* ▬▬▬ HEADER ▬▬▬ */}
          <header id="hdr">
            <div id="hdr-brand">
              <div id="hdr-icon">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/uploads/custom-logo.png" alt="Logo" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px'}} />
              </div>
              <div>
                <div id="hdr-title">{centro?.nombre || 'Nova Skill Kids'}</div>
                <div id="hdr-subtitle">Centro de Desarrollo Infantil</div>
              </div>
            </div>
            <div id="hdr-meta">
              <div id="hdr-doctype">Expediente del Menor</div>
              <div id="hdr-date">{dateStr}</div>
              <div id="hdr-code">Código: EK-{String(data.id).padStart(4, '0')}</div>
            </div>
          </header>

          {/* ▬▬▬ ACCENT LINE ▬▬▬ */}
          <div id="accent-line"></div>

          {/* ▬▬▬ PROFILE HERO ▬▬▬ */}
          <section id="hero">
            <div id="hero-photo-wrap">
              {data.photoUrl
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={data.photoUrl} alt={data.firstName} id="hero-photo" />
                : <div id="hero-initials">{data.firstName[0]}{data.lastName[0]}</div>
              }
            </div>
            <div id="hero-text">
              <h1 id="hero-name">{data.firstName} {data.lastName}</h1>
              <div id="hero-tags">
                <span className="tag tag-green">{statusMap[data.status] || 'Activo'}</span>
                <span className="tag">{age} años</span>
                <span className="tag">{genderMap[data.gender] || 'No especificado'}</span>
                {data.classroomName && <span className="tag">{data.classroomName}</span>}
                <span className="tag tag-red">🩸 {bloodType}</span>
              </div>
            </div>
          </section>

          {/* ▬▬▬ CONTENT GRID ▬▬▬ */}
          <div id="content">

            {/* ── COL LEFT ── */}
            <div id="col-left">

              {/* Datos Personales */}
              <div className="card">
                <div className="card-hdr ch-violet">
                  <span className="card-dot cd-violet"></span>
                  Información Personal
                </div>
                <table className="dt"><tbody>
                  <tr><td className="dt-k">Nombre completo</td><td className="dt-v">{data.firstName} {data.lastName}</td></tr>
                  <tr><td className="dt-k">Fecha de nacimiento</td><td className="dt-v">{birthStr}</td></tr>
                  <tr><td className="dt-k">Edad</td><td className="dt-v">{age} años</td></tr>
                  <tr><td className="dt-k">Sexo</td><td className="dt-v">{genderMap[data.gender] || 'No especificado'}</td></tr>
                  <tr><td className="dt-k">Aula</td><td className="dt-v">{data.classroomName || 'Sin asignar'}</td></tr>
                  <tr><td className="dt-k">Estado</td><td className="dt-v">{statusMap[data.status] || 'Activo'}</td></tr>
                </tbody></table>
              </div>

              {/* Perfil Médico */}
              <div className="card">
                <div className="card-hdr ch-rose">
                  <span className="card-dot cd-rose"></span>
                  Perfil Médico
                </div>
                <table className="dt"><tbody>
                  <tr><td className="dt-k">Tipo de sangre</td><td className="dt-v dt-accent">{bloodType}</td></tr>
                  <tr><td className="dt-k">Alergias</td><td className="dt-v">{data.medical?.allergies || 'Ninguna registrada'}</td></tr>
                  <tr><td className="dt-k">Condiciones</td><td className="dt-v">{data.medical?.conditions || 'Ninguna'}</td></tr>
                  <tr><td className="dt-k">Medicamentos autorizados</td><td className="dt-v">{data.medical?.authorizedMeds || 'Ninguno'}</td></tr>
                  <tr><td className="dt-k">Vacunas</td><td className="dt-v">{data.medical?.vaccines || 'No especificadas'}</td></tr>
                </tbody></table>
              </div>
            </div>

            {/* ── COL RIGHT ── */}
            <div id="col-right">

              {/* Tutor */}
              <div className="card">
                <div className="card-hdr ch-teal">
                  <span className="card-dot cd-teal"></span>
                  Tutor / Responsable
                </div>
                {tutor ? (() => {
                  const rawAddress = tutor.address || '';
                  const cedulaMatch = rawAddress.match(/\(Cédula:\s*([^)]+)\)/);
                  const cedula = cedulaMatch ? cedulaMatch[1].trim() : null;
                  const cleanAddress = rawAddress.replace(/\s*\(Cédula:[^)]*\)/, '').trim();
                  return (
                    <table className="dt"><tbody>
                      <tr><td className="dt-k">Nombre</td><td className="dt-v">{tutor.firstName} {tutor.lastName}</td></tr>
                      <tr><td className="dt-k">Parentesco</td><td className="dt-v">{tutor.relationship}</td></tr>
                      <tr><td className="dt-k">Teléfono</td><td className="dt-v">{tutor.phone || '—'}</td></tr>
                      <tr><td className="dt-k">Correo</td><td className="dt-v">{tutor.email || '—'}</td></tr>
                      {cedula && <tr><td className="dt-k">Cédula</td><td className="dt-v">{cedula}</td></tr>}
                      <tr><td className="dt-k">Dirección</td><td className="dt-v">{cleanAddress || '—'}</td></tr>
                    </tbody></table>
                  );
                })() : <div className="card-empty">Sin tutor registrado</div>}
              </div>

              {/* Emergencias */}
              <div className="card">
                <div className="card-hdr ch-amber">
                  <span className="card-dot cd-amber"></span>
                  Contactos de Emergencia
                </div>
                <table className="dt"><tbody>
                  <tr><td className="dt-k">Contacto alterno</td><td className="dt-v">{emergencyContact}</td></tr>
                </tbody></table>
                <div className="card-sub">
                  <div className="card-sub-label">Personas autorizadas para recogida</div>
                  <div className="chip-list">
                    {authorizedPeople.split(',').map((p: string, i: number) =>
                      <span key={i} className="chip">{p.trim()}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Evaluaciones */}
              {Object.keys(evalScores).length > 0 && (
                <div className="card">
                  <div className="card-hdr ch-indigo">
                    <span className="card-dot cd-indigo"></span>
                    Evaluaciones de Desarrollo
                  </div>
                  <div style={{ padding: '12px 14px' }}>
                    {Object.entries(evalScores).map(([area, score]) => (
                      <div key={area} style={{ marginBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                          <span>{area}</span>
                          <span style={{ color: score >= 80 ? '#059669' : score >= 50 ? '#d97706' : '#dc2626' }}>{score}%</span>
                        </div>
                        <div style={{ height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: score + '%', backgroundColor: score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444', borderRadius: '3px' }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* ▬▬▬ FOOTER ▬▬▬ */}
          <footer id="ftr">
            <div id="ftr-left">
              <strong>Nova Skill Kids</strong> · {dateStr}
            </div>
            <div id="ftr-center">
              Documento confidencial — Uso exclusivo institucional
            </div>
            <div id="ftr-right">
              1 / 1
            </div>
          </footer>

          {/* Watermark */}
          <div id="watermark">NOVA SKILL KIDS</div>

        </div>
      </div>

      {/* ═══════════════════════ STYLES ═══════════════════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'Inter', -apple-system, sans-serif;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }

        /* ────── TOOLBAR ────── */
        #toolbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 999;
          height: 54px; display: flex; align-items: center; justify-content: space-between;
          padding: 0 24px;
          background: linear-gradient(135deg, #1e293b, #334155) !important;
          -webkit-print-color-adjust: exact !important;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        #tb-back {
          display: flex; align-items: center; gap: 8px;
          font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.7); text-decoration: none;
          transition: color 0.15s;
        }
        #tb-back:hover { color: #fff; }

        /* ────── PAPER BG ────── */
        #paper-bg {
          background: linear-gradient(180deg, #94a3b8 0%, #64748b 100%);
          min-height: 100vh;
          padding: 78px 24px 48px;
          display: flex; justify-content: center; align-items: flex-start;
        }

        /* ────── PAPER ────── */
        #paper {
          position: relative;
          width: 210mm; min-height: 297mm;
          background: #fff !important;
          border-radius: 4px;
          overflow: hidden;
          box-shadow:
            0 2px 4px rgba(0,0,0,0.05),
            0 12px 40px rgba(0,0,0,0.15),
            0 0 0 1px rgba(0,0,0,0.03);
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        /* ────── HEADER ────── */
        #hdr {
          background: #1e293b !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          display: flex; justify-content: space-between; align-items: center;
          padding: 22px 32px;
        }
        #hdr-brand { display: flex; align-items: center; gap: 14px; }
        #hdr-icon {
          width: 44px; height: 44px; border-radius: 12px;
          background: linear-gradient(135deg, #7c3aed, #6d28d9) !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        #hdr-title { font-size: 17px; font-weight: 800; color: #fff !important; letter-spacing: -0.2px; }
        #hdr-subtitle { font-size: 10px; font-weight: 400; color: rgba(255,255,255,0.5) !important; margin-top: 2px; letter-spacing: 0.5px; }
        #hdr-meta { text-align: right; }
        #hdr-doctype {
          font-size: 10px; font-weight: 700; letter-spacing: 1.8px;
          text-transform: uppercase; color: rgba(255,255,255,0.4) !important;
        }
        #hdr-date { font-size: 12px; font-weight: 500; color: rgba(255,255,255,0.8) !important; margin-top: 4px; }
        #hdr-code { font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.35) !important; margin-top: 2px; font-variant-numeric: tabular-nums; }

        /* ────── ACCENT LINE ────── */
        #accent-line {
          height: 3px;
          background: linear-gradient(90deg, #7c3aed 0%, #a855f7 35%, #ec4899 70%, #f43f5e 100%) !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        /* ────── HERO ────── */
        #hero {
          display: flex; align-items: center; gap: 22px;
          padding: 24px 32px;
          border-bottom: 1px solid #f1f5f9;
        }
        #hero-photo-wrap { flex-shrink: 0; }
        #hero-photo {
          width: 90px; height: 90px; border-radius: 20px;
          object-fit: cover; border: 3px solid #fff;
          box-shadow: 0 4px 20px rgba(0,0,0,0.12);
        }
        #hero-initials {
          width: 90px; height: 90px; border-radius: 20px;
          background: linear-gradient(135deg, #7c3aed, #a855f7) !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          display: flex; align-items: center; justify-content: center;
          font-size: 30px; font-weight: 900; color: #fff !important;
          border: 3px solid #fff;
          box-shadow: 0 4px 20px rgba(124,58,237,0.2);
        }
        #hero-name {
          font-size: 28px; font-weight: 900; color: #0f172a !important;
          letter-spacing: -0.5px; margin-bottom: 10px; line-height: 1;
        }
        #hero-tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .tag {
          display: inline-flex; align-items: center;
          font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px;
          padding: 4px 10px; border-radius: 6px;
          background: #f8fafc !important; border: 1px solid #e2e8f0; color: #475569 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .tag-green { background: #ecfdf5 !important; border-color: #a7f3d0; color: #065f46 !important; }
        .tag-red { background: #fff1f2 !important; border-color: #fecdd3; color: #9f1239 !important; }

        /* ────── CONTENT ────── */
        #content {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 0; padding: 16px 24px;
          column-gap: 14px; row-gap: 0;
        }
        #col-left, #col-right { display: flex; flex-direction: column; gap: 12px; }

        /* ────── CARDS ────── */
        .card {
          border: 1px solid #e8ecf1; border-radius: 10px; overflow: hidden;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .card-hdr {
          font-size: 10px; font-weight: 800; letter-spacing: 1px;
          text-transform: uppercase; padding: 9px 14px;
          display: flex; align-items: center; gap: 8px;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .card-dot {
          width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .ch-violet { background: #faf5ff !important; color: #6d28d9 !important; border-bottom: 1px solid #ede9fe; }
        .cd-violet { background: #7c3aed !important; }
        .ch-rose   { background: #fff1f2 !important; color: #be123c !important; border-bottom: 1px solid #fecdd3; }
        .cd-rose   { background: #e11d48 !important; }
        .ch-teal   { background: #f0fdfa !important; color: #115e59 !important; border-bottom: 1px solid #99f6e4; }
        .cd-teal   { background: #0d9488 !important; }
        .ch-amber  { background: #fffbeb !important; color: #92400e !important; border-bottom: 1px solid #fde68a; }
        .cd-amber  { background: #d97706 !important; }
        .ch-indigo { background: #eef2ff !important; color: #3730a3 !important; border-bottom: 1px solid #c7d2fe; }
        .cd-indigo { background: #4f46e5 !important; }

        .card-empty { padding: 12px 14px; font-size: 11px; color: #94a3b8; font-style: italic; }

        /* ────── DATA TABLE ────── */
        .dt { width: 100%; border-collapse: collapse; }
        .dt td { padding: 6px 14px; vertical-align: top; }
        .dt tr { border-bottom: 1px solid #f8fafc; }
        .dt tr:last-child { border-bottom: none; }
        .dt-k {
          font-size: 9px; font-weight: 700; color: #94a3b8 !important;
          text-transform: uppercase; letter-spacing: 0.4px;
          width: 44%; white-space: nowrap;
        }
        .dt-v {
          font-size: 11px; font-weight: 600; color: #1e293b !important;
          text-align: right;
        }
        .dt-accent { color: #dc2626 !important; font-weight: 800; }

        /* ────── CARD SUB SECTION ────── */
        .card-sub { padding: 8px 14px; border-top: 1px solid #f1f5f9; }
        .card-sub-label {
          font-size: 9px; font-weight: 700; color: #94a3b8 !important;
          text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 6px;
        }
        .chip-list { display: flex; flex-wrap: wrap; gap: 5px; }
        .chip {
          background: #f0fdf4 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          border: 1px solid #86efac; color: #166534 !important;
          font-size: 10px; font-weight: 700; padding: 3px 9px; border-radius: 6px;
        }

        /* ────── FOOTER ────── */
        #ftr {
          display: flex; justify-content: space-between; align-items: center;
          padding: 10px 32px;
          border-top: 1px solid #e2e8f0;
          margin-top: 8px;
          font-size: 8px; color: #94a3b8 !important;
          letter-spacing: 0.3px;
        }
        #ftr strong { font-weight: 700; color: #64748b !important; }
        #ftr-center { text-align: center; }
        #ftr-right { font-variant-numeric: tabular-nums; }

        /* ────── WATERMARK ────── */
        #watermark {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%) rotate(-35deg);
          font-size: 72px; font-weight: 900; letter-spacing: 12px;
          color: rgba(0,0,0,0.018) !important;
          pointer-events: none; white-space: nowrap;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        /* ═══════ PRINT ═══════ */
        @media print {
          @page { size: A4; margin: 0; }
          #toolbar { display: none !important; }
          #paper-bg {
            background: none !important;
            padding: 0 !important; min-height: auto !important;
            display: block !important;
          }
          #paper {
            width: 210mm !important; min-height: 297mm !important;
            border-radius: 0 !important; box-shadow: none !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
}
