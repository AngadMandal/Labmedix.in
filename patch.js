const fs = require('fs');
let code = fs.readFileSync('src/pages/cards/CardListPage.tsx', 'utf8');

const target = `                      {/* Card Studio Link & Delete Controls */}
                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => handleToggleFreeze(card)}
                          className={\`text-[10px] font-bold flex items-center gap-1 transition-colors \${
                            card.status === 'suspended'
                              ? 'text-emerald-400 hover:underline'
                              : 'text-amber-400 hover:underline'
                          }\`}
                        >
                          {card.status === 'suspended' ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                          {card.status === 'suspended' ? 'Unfreeze Card' : 'Freeze Card'}
                        </button>
                        <div className="flex items-center gap-2">`;

const replacement = `                      {/* Card Studio Link & Delete Controls */}
                      <div className="flex items-center justify-between pt-1">
                        {card.status === 'pending' ? (
                          <button
                            type="button"
                            onClick={() => handleApproveCard(card)}
                            className="text-[10px] font-bold flex items-center gap-1 transition-colors text-teal-400 hover:underline"
                          >
                            <Check className="w-3 h-3" /> Approve Card
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggleFreeze(card)}
                            className={\`text-[10px] font-bold flex items-center gap-1 transition-colors \${
                              card.status === 'suspended'
                                ? 'text-emerald-400 hover:underline'
                                : 'text-amber-400 hover:underline'
                            }\`}
                          >
                            {card.status === 'suspended' ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                            {card.status === 'suspended' ? 'Unfreeze Card' : 'Freeze Card'}
                          </button>
                        )}
                        <div className="flex items-center gap-2">`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/pages/cards/CardListPage.tsx', code);
  console.log('Patched');
} else {
  console.log('Target not found');
}
