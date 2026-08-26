const fs = require('fs');
let code = fs.readFileSync('src/pages/portal/PatientPortalPage.tsx', 'utf8');

const regex = /\{patientCard && \([\s\S]*?Present this card QR code at hospital counter \/ diagnostics for instant cashless billing\.\n              <\/p>\n            <\/div>/;

const replacement = `{patientCard && (
                <>
                  <div className="scale-90 sm:scale-100 origin-center my-2">
                    {isFlipped ? (
                      <CR80CardBack
                        patient={authenticatedPatient}
                        card={patientCard}
                        membership={membership}
                        company={company}
                      />
                    ) : (
                      <CR80CardFront
                        patient={authenticatedPatient}
                        card={patientCard}
                        membership={membership}
                        company={company}
                      />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4 w-[340px]">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase block font-sans flex items-center gap-1">
                        <Radio className="w-3 h-3 text-emerald-400" />
                        NFC Chip UID
                      </span>
                      <strong className="text-xs font-bold text-emerald-400 block mt-1 truncate">
                        {patientCard.nfcUid || '04:E2:89:1A:B5:4C:80'}
                      </strong>
                      <span className="text-[9px] text-slate-500 block">13.56 MHz ISO 14443-A</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase block font-sans flex items-center gap-1">
                        <Users2 className="w-3 h-3 text-amber-400" />
                        Family Shield
                      </span>
                      <strong className="text-xs font-bold text-amber-300 block mt-1">
                        {familyMembers.length > 0 ? \`\${familyMembers.length} Members Covered\` : '1 Head Covered'}
                      </strong>
                      <button
                        type="button"
                        onClick={() => setActiveTab('family_shield')}
                        className="text-[9.5px] text-teal-400 hover:underline block font-sans font-bold mt-0.5"
                      >
                        View Family Hub →
                      </button>
                    </div>
                  </div>
                </>
              )}
              <p className="text-[11px] text-slate-400 text-center mt-2 font-mono">
                Present this card QR code at hospital counter / diagnostics for instant cashless billing.
              </p>
            </div>`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/pages/portal/PatientPortalPage.tsx', code);
console.log('Fixed block');
