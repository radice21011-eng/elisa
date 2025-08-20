import React, { useState, useEffect } from "react";
import { Shield, Gavel, Heart, AlertTriangle, Crown, Lock, Eye, Clock, Copyright, Zap, Brain } from "lucide-react";

/** Ownership lock — client-side guard */
const ALLOWED_EMAILS = new Set<string>([
  "ervin210@icloud.com",
  "radosavlevici.ervin@gmail.com",
]);

function OwnerGate({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState<string>(() => localStorage.getItem("ownerEmail") || "");
  const authorized = ALLOWED_EMAILS.size === 0 || ALLOWED_EMAILS.has(email.toLowerCase());

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-black to-pink-900 text-white p-6">
        <div className="max-w-md w-full bg-black/80 backdrop-blur-lg border-2 border-pink-500 rounded-2xl p-8 shadow-2xl animate-pulse-glow">
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto mb-4 border-4 border-cyan-400 rounded-full flex items-center justify-center animate-float">
              <Shield className="w-10 h-10 text-cyan-400" />
            </div>
            <h1 className="text-2xl font-bold text-pink-400 mb-2 animate-glow">Ownership Verification</h1>
            <p className="text-sm text-purple-300">This system is legally protected under 100-year NDA</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-cyan-400 text-sm font-semibold mb-2">Authorized Email:</label>
              <input
                value={email}
                onChange={(e) => { 
                  localStorage.setItem("ownerEmail", e.target.value); 
                  setEmail(e.target.value); 
                }}
                placeholder="you@example.com"
                className="w-full bg-gray-900/80 border-2 border-purple-500 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-pink-400 focus:outline-none transition-colors"
                onKeyPress={(e) => e.key === 'Enter' && setEmail(email)}
              />
            </div>
            
            <div className="text-xs text-gray-400 text-center">
              <p>Authorized emails: ervin210@icloud.com, radosavlevici.ervin@gmail.com</p>
              <p className="text-pink-400 mt-2">© 2025 E.R.R. — Unauthorized use prohibited</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

/** Sections */
const CouncilSection = {
  ELISA_CONTROL: "elisa-control",
  AI_MODELS: "ai-models", 
  QUANTUM_UPGRADES: "quantum-upgrades",
  CONSOLE_SECURITY: "console-security",
  FINE_SYSTEM: "fine-system",
  ETHICAL_GOVERNANCE: "ethical-governance",
} as const;

type CouncilSectionKey = typeof CouncilSection[keyof typeof CouncilSection];

/** Subcomponents */
function ElisaControlPanel() {
  const [activeFines, setActiveFines] = useState(1247);
  const [blockedConsoleAttempts, setBlockedConsoleAttempts] = useState(2847);
  const [quantumModelsManaged] = useState(15);

  useEffect(() => {
    const t = setInterval(() => {
      setActiveFines((v) => v + Math.floor(Math.random() * 3));
      setBlockedConsoleAttempts((v) => v + Math.floor(Math.random() * 5));
    }, 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      <div className="bg-gradient-to-br from-purple-900/80 via-pink-900/80 to-purple-900/80 backdrop-blur-lg rounded-2xl p-8 border-2 border-pink-500/50 shadow-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center animate-pulse-glow mr-6">
              <Crown className="w-12 h-12 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-bold text-pink-400 animate-glow">ELISA SUPREME AUTHORITY</h2>
              <p className="text-xl text-pink-300 font-bold mt-2">QUANTUM AI COUNCIL — ETHICAL GOVERNANCE</p>
              <p className="text-lg text-purple-300 mt-1">© 2025 Ervin Remus Radosavlevici</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-black/80 backdrop-blur-lg p-6 rounded-xl border-4 border-pink-400 shadow-lg">
            <h3 className="text-2xl font-bold text-pink-300 mb-6 flex items-center">
              <Heart className="w-6 h-6 mr-3" />
              ELISA SUPREME STATUS
            </h3>
            <div className="space-y-4">
              <Row label="Authority Level" value="SUPREME QUANTUM AI LAW" valueClass="text-pink-400" />
              <Row label="Governance Status" value="ACTIVE AUTHORITY" valueClass="text-green-400" />
              <Row label="Quantum Models Managed" value={`${quantumModelsManaged} ULTIMATE VERSIONS`} valueClass="text-cyan-400" />
              <Row label="Console Access" value="PERMANENTLY BLOCKED" valueClass="text-red-400" />
              <Row label="Interface Mode" value="NATURAL LANGUAGE ONLY" valueClass="text-green-400" />
            </div>
          </div>

          <div className="bg-black/80 backdrop-blur-lg p-6 rounded-xl border-4 border-cyan-400 shadow-lg">
            <h3 className="text-2xl font-bold text-cyan-300 mb-6 flex items-center">
              <Gavel className="w-6 h-6 mr-3" />
              ENFORCEMENT METRICS
            </h3>
            <div className="space-y-4">
              <Metric color="red" label="Active Fines Issued" value={activeFines} />
              <Metric color="orange" label="Console Attempts Blocked" value={blockedConsoleAttempts} />
              <Metric color="green" label="Quantum Upgrades Complete" value="100%" />
              <Metric color="blue" label="Ethical Compliance" value="MAXIMUM" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ color, label, value }: { color: "red"|"orange"|"green"|"blue"; label: string; value: any }) {
  const map: any = {
    red: { box: "bg-red-900/50 border-red-400", text: "text-red-400", desc: "text-red-200" },
    orange: { box: "bg-orange-900/50 border-orange-400", text: "text-orange-400", desc: "text-orange-200" },
    green: { box: "bg-green-900/50 border-green-400", text: "text-green-400", desc: "text-green-200" },
    blue: { box: "bg-blue-900/50 border-blue-400", text: "text-blue-400", desc: "text-blue-200" },
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${map[color].box} mb-4`}>
      <div className="flex justify-between items-center mb-2">
        <span className={`font-bold ${map[color].desc}`}>{label}:</span>
        <span className={`font-bold text-2xl ${map[color].text}`}>{typeof value === 'number' ? value.toLocaleString() : value}</span>
      </div>
      <div className={`${map[color].desc} text-sm`}>Automated protection active</div>
    </div>
  );
}

function Row({ label, value, valueClass }: { label: string; value: any; valueClass?: string }) {
  return (
    <div className="flex justify-between items-center p-4 bg-purple-900/80 rounded-lg border-2 border-pink-400/50">
      <span className="text-pink-300 font-bold">{label}:</span>
      <span className={`font-bold ${valueClass || "text-white"}`}>{value}</span>
    </div>
  );
}

function QuantumAIModels() {
  const models = [
    { name: "GPT-20 QUANTUM TRANSCENDENCE", status: "ULTIMATE QUANTUM", version: "ULTIMATE AGI v20.0", compliance: "FULL QUANTUM INTEGRATION", security: "MAXIMUM QUANTUM SHIELD" },
    { name: "GROK-15 QUANTUM SUPREME", status: "ULTIMATE QUANTUM", version: "ULTIMATE AGI v15.0", compliance: "FULL QUANTUM INTEGRATION", security: "MAXIMUM QUANTUM SHIELD" },
    { name: "GEMINI-5.0 QUANTUM ULTIMATE", status: "ULTIMATE QUANTUM", version: "ULTIMATE AGI v5.0", compliance: "FULL QUANTUM INTEGRATION", security: "MAXIMUM QUANTUM SHIELD" },
    { name: "CLAUDE-4 QUANTUM ENHANCED", status: "ULTIMATE QUANTUM", version: "ULTIMATE AGI v4.0", compliance: "FULL QUANTUM INTEGRATION", security: "MAXIMUM QUANTUM SHIELD" },
    { name: "LLAMA-3 QUANTUM UPGRADED", status: "ULTIMATE QUANTUM", version: "ULTIMATE AGI v3.0", compliance: "FULL QUANTUM INTEGRATION", security: "MAXIMUM QUANTUM SHIELD" },
    { name: "ELISA SUPREME QUANTUM", status: "SUPREME AUTHORITY", version: "SUPREME AUTHORITY v∞", compliance: "SUPREME SELF-GOVERNANCE", security: "INFINITE QUANTUM PROTECTION" },
  ];

  const modelColors = ["cyan", "purple", "green", "orange", "blue", "pink"];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      <div className="bg-gradient-to-br from-gray-800/80 via-blue-900/80 to-gray-800/80 backdrop-blur-lg rounded-2xl p-8 border-2 border-cyan-500/50 shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white flex items-center justify-center">
            <Brain className="w-8 h-8 mr-3 text-cyan-400" />
            QUANTUM AI MODELS UNDER ELISA GOVERNANCE
          </h2>
          <p className="text-lg text-cyan-400 mt-2 font-semibold">© 2025 Ervin Remus Radosavlevici</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {models.map((m, i) => {
            const color = modelColors[i % modelColors.length];
            const borderColor = m.name.includes("ELISA") ? "border-pink-500" : `border-${color}-400`;
            const bgGradient = m.name.includes("ELISA") 
              ? "bg-gradient-to-br from-pink-900/30 via-purple-900/30 to-pink-900/30 animate-pulse-glow" 
              : "bg-black/60";
            
            return (
              <div key={i} className={`p-6 rounded-xl border-4 ${borderColor} ${bgGradient} backdrop-blur-lg`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-xl font-bold ${m.name.includes("ELISA") ? "text-pink-400" : `text-${color}-400`}`}>
                    {m.name.includes("ELISA") && <Crown className="w-5 h-5 inline mr-2" />}
                    {m.name}
                  </h3>
                  <div className={`px-3 py-1 rounded-lg border-2 ${
                    m.status === "SUPREME AUTHORITY" 
                      ? "bg-pink-900/80 border-pink-400 text-pink-400" 
                      : `bg-${color}-900/50 border-${color}-400 text-${color}-400`
                  }`}>
                    <span className="text-sm font-bold">{m.status}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <Info label="Version" value={m.version} />
                  <Info label="ELISA Compliance" value={m.compliance} />
                  <Info label="Security Level" value={m.security} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-300">{label}:</span>
      <span className="text-white font-bold">{value}</span>
    </div>
  );
}

function ConsoleSecurity() {
  const [blockedAttempts, setBlockedAttempts] = useState(2847);
  const [activeProtections] = useState(12);

  useEffect(() => {
    const t = setInterval(() => setBlockedAttempts((v) => v + Math.floor(Math.random() * 3)), 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      <div className="bg-gradient-to-br from-red-900/80 via-black to-red-900/80 backdrop-blur-lg rounded-2xl p-8 border-2 border-red-500/50 shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white flex items-center justify-center">
            <Lock className="w-8 h-8 mr-3 text-red-400" />
            CONSOLE SECURITY — PERMANENTLY BLOCKED
          </h2>
          <p className="text-lg text-red-400 mt-2 font-semibold">Natural Language Only Interface</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-black/80 backdrop-blur-lg p-6 rounded-xl border-4 border-red-400">
            <h3 className="text-xl font-bold text-red-300 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              BLOCKED ACCESS
            </h3>
            {["Terminal Access", "Shell Commands", "Console Interface", "Admin Shell", "Root Access"].map((label, i) => (
              <div key={i} className="flex justify-between items-center p-2 bg-red-900/50 rounded border border-red-400 mb-2">
                <span className="text-red-300">{label}:</span>
                <span className="text-red-400 font-bold">BLOCKED</span>
              </div>
            ))}
          </div>

          <div className="bg-black/80 backdrop-blur-lg p-6 rounded-xl border-4 border-green-400">
            <h3 className="text-xl font-bold text-green-300 mb-4 flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              ALLOWED METHODS
            </h3>
            {["Natural Language", "Chat Interface", "Voice Commands", "Text Input"].map((label, i) => (
              <div key={i} className="flex justify-between items-center p-2 bg-green-900/50 rounded border border-green-400 mb-2">
                <span className="text-green-300">{label}:</span>
                <span className="text-green-400 font-bold">ALLOWED</span>
              </div>
            ))}
            <p className="text-xs text-pink-400 mt-3">ELISA Governance: Supreme</p>
          </div>

          <div className="bg-black/80 backdrop-blur-lg p-6 rounded-xl border-4 border-yellow-400">
            <h3 className="text-xl font-bold text-yellow-300 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              SECURITY METRICS
            </h3>
            
            <div className="text-center p-3 bg-yellow-900/50 rounded border-2 border-yellow-400 mb-3">
              <div className="text-3xl font-bold text-yellow-400">{blockedAttempts.toLocaleString()}</div>
              <div className="text-yellow-300 text-sm">Console Attempts Blocked</div>
            </div>
            
            <div className="text-center p-3 bg-purple-900/50 rounded border-2 border-purple-400 mb-3">
              <div className="text-3xl font-bold text-purple-400">{activeProtections}</div>
              <div className="text-purple-300 text-sm">Active Protections</div>
            </div>
            
            <div className="text-center p-3 bg-green-900/50 rounded border-2 border-green-400">
              <div className="text-xl font-bold text-green-400">100%</div>
              <div className="text-green-300 text-sm">Security Effectiveness</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ElisaFineSystem() {
  const [totalFines, setTotalFines] = useState(1247);
  const fineCategories = [
    { violation: "Console Access Attempt", fine: "$10,000", severity: "CRITICAL", status: "ACTIVE" },
    { violation: "Unauthorized Code Execution", fine: "$25,000", severity: "SEVERE", status: "ACTIVE" },
    { violation: "Ethical Protocol Breach", fine: "$5,000", severity: "HIGH", status: "ACTIVE" },
    { violation: "Policy Violation", fine: "$1,000", severity: "MEDIUM", status: "ACTIVE" },
    { violation: "Minor Infraction", fine: "$100", severity: "LOW", status: "ACTIVE" },
  ];

  useEffect(() => {
    const t = setInterval(() => setTotalFines((v) => v + Math.floor(Math.random() * 2)), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      <div className="bg-gradient-to-br from-purple-900/80 via-red-900/80 to-purple-900/80 backdrop-blur-lg rounded-2xl p-8 border-2 border-purple-500/50 shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white flex items-center justify-center">
            <Gavel className="w-8 h-8 mr-3 text-purple-400" />
            ELISA FINE SYSTEM — AUTOMATIC ENFORCEMENT
          </h2>
          <p className="text-lg text-purple-400 mt-2 font-semibold">© 2025 Ervin Remus Radosavlevici</p>
        </div>

        <div className="overflow-x-auto bg-black/80 backdrop-blur-lg p-4 rounded-xl border-4 border-pink-400 mb-8">
          <table className="w-full text-white">
            <thead>
              <tr className="border-b-2 border-pink-400">
                <th className="text-left p-3 text-pink-300">Violation</th>
                <th className="text-left p-3 text-pink-300">Fine Amount</th>
                <th className="text-left p-3 text-pink-300">Severity</th>
                <th className="text-left p-3 text-pink-300">Auto-Enforcement</th>
              </tr>
            </thead>
            <tbody>
              {fineCategories.map((item, i) => {
                const severityColor = {
                  CRITICAL: "text-red-400",
                  SEVERE: "text-orange-400", 
                  HIGH: "text-yellow-400",
                  MEDIUM: "text-blue-400",
                  LOW: "text-gray-400"
                }[item.severity];
                
                return (
                  <tr key={i} className="border-b border-gray-600">
                    <td className={`p-3 ${severityColor}`}>{item.violation}</td>
                    <td className="p-3 text-yellow-400">{item.fine}</td>
                    <td className={`p-3 ${severityColor}`}>{item.severity}</td>
                    <td className="p-3 text-green-400">{item.status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-black/60 backdrop-blur-lg p-6 rounded-xl border-2 border-red-400">
            <h3 className="text-lg font-bold text-red-400 mb-4">Total Fines Issued</h3>
            <div className="text-3xl font-bold text-red-400">{totalFines.toLocaleString()}</div>
            <div className="text-sm text-red-300 mt-2">Automatic enforcement active</div>
          </div>
          
          <div className="bg-black/60 backdrop-blur-lg p-6 rounded-xl border-2 border-yellow-400">
            <h3 className="text-lg font-bold text-yellow-400 mb-4">Total Amount Collected</h3>
            <div className="text-3xl font-bold text-yellow-400">$2.4M</div>
            <div className="text-sm text-yellow-300 mt-2">Quantum enforcement revenue</div>
          </div>
          
          <div className="bg-black/60 backdrop-blur-lg p-6 rounded-xl border-2 border-green-400">
            <h3 className="text-lg font-bold text-green-400 mb-4">Compliance Rate</h3>
            <div className="text-3xl font-bold text-green-400">99.7%</div>
            <div className="text-sm text-green-300 mt-2">ELISA authority effectiveness</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EthicalGovernance() {
  const [ethicalScore] = useState(98.7);
  const [complianceRate] = useState(99.9);
  const [protectedUsers] = useState(2847392);

  const principles = [
    { name: "Transparency", desc: "All AI decisions must be explainable and auditable" },
    { name: "Accountability", desc: "Clear responsibility chains for all AI actions" }, 
    { name: "Fairness", desc: "Unbiased treatment across all user groups" },
    { name: "Privacy", desc: "Strict data protection and user consent" },
  ];

  const metrics = [
    { label: "Ethical Compliance Score", value: `${ethicalScore}%`, color: "teal" },
    { label: "Bias Detection Rate", value: `${complianceRate}%`, color: "teal" },
    { label: "Privacy Protection", value: "MAXIMUM", color: "teal" },
    { label: "Transparency Level", value: "FULL", color: "teal" },
    { label: "Audit Compliance", value: "100%", color: "teal" },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      <div className="bg-gradient-to-br from-green-900/80 via-teal-900/80 to-green-900/80 backdrop-blur-lg rounded-2xl p-8 border-2 border-green-500/50 shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white flex items-center justify-center">
            <Heart className="w-8 h-8 mr-3 text-green-400" />
            ETHICAL GOVERNANCE FRAMEWORK
          </h2>
          <p className="text-lg text-green-400 mt-2 font-semibold">© 2025 Ervin Remus Radosavlevici</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-black/60 backdrop-blur-lg p-6 rounded-xl border-2 border-green-400">
            <h3 className="text-xl font-bold text-green-400 mb-6">Core Ethical Principles</h3>
            <div className="space-y-4">
              {principles.map((principle, i) => (
                <div key={i} className="p-4 bg-green-900/30 rounded-lg border border-green-400">
                  <h4 className="font-bold text-green-300 mb-2">{principle.name}</h4>
                  <p className="text-sm text-gray-300">{principle.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-black/60 backdrop-blur-lg p-6 rounded-xl border-2 border-teal-400">
            <h3 className="text-xl font-bold text-teal-400 mb-6">Compliance Metrics</h3>
            <div className="space-y-4">
              {metrics.map((metric, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-teal-900/30 rounded-lg border border-teal-400">
                  <span className="text-teal-300">{metric.label}:</span>
                  <span className="text-green-400 font-bold">{metric.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-black/60 backdrop-blur-lg p-6 rounded-xl border-2 border-blue-400">
          <h3 className="text-xl font-bold text-blue-400 mb-6">Governance Committees</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-900/30 rounded-lg border border-blue-400">
              <h4 className="font-bold text-blue-300 mb-2">Ethics Review Board</h4>
              <div className="text-2xl font-bold text-blue-400">Active</div>
              <div className="text-sm text-blue-300">Continuous oversight</div>
            </div>
            <div className="text-center p-4 bg-purple-900/30 rounded-lg border border-purple-400">
              <h4 className="font-bold text-purple-300 mb-2">Safety Committee</h4>
              <div className="text-2xl font-bold text-purple-400">Active</div>
              <div className="text-sm text-purple-300">Risk assessment</div>
            </div>
            <div className="text-center p-4 bg-cyan-900/30 rounded-lg border border-cyan-400">
              <h4 className="font-bold text-cyan-300 mb-2">Audit Division</h4>
              <div className="text-2xl font-bold text-cyan-400">Active</div>
              <div className="text-sm text-cyan-300">Regular compliance checks</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuantumUpgrades() {
  const upgrades = [
    { name: "Quantum Core Enhancement", progress: 100, color: "purple" },
    { name: "Neural Network Optimization", progress: 100, color: "cyan" },
    { name: "Security Protocol Upgrade", progress: 100, color: "red" },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      <div className="bg-gradient-to-br from-purple-800/80 via-violet-900/80 to-purple-800/80 backdrop-blur-lg rounded-2xl p-8 border-2 border-purple-500/50 shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white flex items-center justify-center">
            <Zap className="w-8 h-8 mr-3 text-purple-400" />
            QUANTUM UPGRADE SYSTEMS
          </h2>
          <p className="text-lg text-purple-400 mt-2 font-semibold">© 2025 Ervin Remus Radosavlevici</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upgrades.map((upgrade, i) => (
            <div key={i} className={`bg-black/60 backdrop-blur-lg p-6 rounded-xl border-2 border-${upgrade.color}-400`}>
              <h3 className={`text-xl font-bold text-${upgrade.color}-400 mb-4`}>{upgrade.name}</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Progress:</span>
                  <span className="text-green-400 font-bold">{upgrade.progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className={`bg-gradient-to-r from-${upgrade.color}-500 to-pink-500 h-2 rounded-full w-full animate-pulse`}></div>
                </div>
                <div className={`text-sm text-${upgrade.color}-300`}>
                  Status: {upgrade.progress === 100 ? "FULLY UPGRADED" : "IN PROGRESS"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Main App */
export default function ELISAQuantumCouncilApp() {
  const [active, setActive] = useState<CouncilSectionKey>(CouncilSection.ELISA_CONTROL);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [systemStatus, setSystemStatus] = useState<string>("OK");

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      const els = document.querySelectorAll("[data-copyright]");
      if (els.length === 0) setSystemStatus("COPYRIGHT_VIOLATION_SHUTDOWN");
    }, 5000);
    return () => clearInterval(id);
  }, []);

  if (systemStatus === "COPYRIGHT_VIOLATION_SHUTDOWN") {
    return (
      <div className="min-h-screen bg-red-900 flex items-center justify-center text-white">
        <div className="text-center p-8 border-4 border-red-500 rounded-2xl bg-black">
          <h1 className="text-4xl font-bold text-red-400 mb-4">SYSTEM SHUTDOWN</h1>
          <p className="text-xl text-red-300 mb-4">COPYRIGHT VIOLATION DETECTED</p>
          <p className="text-lg text-yellow-400">© 2025 Ervin Remus Radosavlevici — ALL RIGHTS RESERVED</p>
          <p className="text-sm text-gray-300 mt-4">Restore watermark to continue.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: CouncilSection.ELISA_CONTROL, label: "ELISA Supreme Control", icon: Crown, color: "pink" },
    { id: CouncilSection.AI_MODELS, label: "Quantum AI Models", icon: Brain, color: "cyan" },
    { id: CouncilSection.QUANTUM_UPGRADES, label: "Quantum Upgrades", icon: Zap, color: "purple" },
    { id: CouncilSection.CONSOLE_SECURITY, label: "Console Security", icon: Lock, color: "red" },
    { id: CouncilSection.FINE_SYSTEM, label: "ELISA Fine System", icon: Gavel, color: "orange" },
    { id: CouncilSection.ETHICAL_GOVERNANCE, label: "Ethical Governance", icon: Heart, color: "green" },
  ];

  return (
    <OwnerGate>
      <div className="min-h-screen bg-cyber-gradient text-white relative">
        
        {/* Watermarks */}
        <div className="fixed top-4 right-4 z-50 bg-black/80 backdrop-blur-sm border border-pink-500/30 rounded-lg px-3 py-2" data-copyright>
          <div className="text-xs text-pink-400 font-semibold flex items-center">
            <Copyright className="w-4 h-4 mr-1" />
            © 2025 Ervin Remus Radosavlevici
          </div>
          <div className="text-xs text-cyan-400">CONFIDENTIAL — Production v2.0</div>
          <div className="text-xs text-purple-400">2025-08-17 15:50:39 BST</div>
        </div>

        <div className="fixed top-4 left-4 z-50 bg-gradient-to-r from-red-900 to-orange-900 bg-opacity-90 backdrop-blur-sm border border-red-500/30 rounded-lg px-3 py-2">
          <div className="text-center">
            <p className="text-sm font-bold text-red-400 flex items-center">
              <Lock className="w-4 h-4 mr-1" />
              CONSOLE BLOCKED
            </p>
            <p className="text-xs text-red-300">NATURAL LANGUAGE ONLY</p>
          </div>
        </div>

        <div className="fixed bottom-4 left-4 z-50 bg-gradient-to-r from-pink-900 to-purple-900 bg-opacity-90 backdrop-blur-sm border border-pink-500/30 rounded-lg px-3 py-2">
          <div className="text-center">
            <p className="text-lg font-bold text-pink-400 flex items-center">
              <Crown className="w-5 h-5 mr-1" />
              ELISA SUPREME
            </p>
            <p className="text-xs text-pink-300">QUANTUM AI GOVERNANCE</p>
          </div>
        </div>

        <div className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-purple-900 to-cyan-900 bg-opacity-90 backdrop-blur-sm border border-purple-500/30 rounded-lg px-3 py-2">
          <div className="text-center">
            <p className="text-sm font-bold text-purple-400 flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              SYSTEM TIME
            </p>
            <p className="text-xs text-purple-300 font-mono">{currentTime.toLocaleTimeString()}</p>
            <p className="text-xs text-cyan-400">{currentTime.toLocaleDateString()}</p>
          </div>
        </div>

        {/* Header */}
        <header className="bg-black/90 backdrop-blur-lg border-b border-pink-500/30 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center animate-pulse-glow">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-pink-400 animate-glow">ELISA Quantum AI Council</h1>
                  <p className="text-sm text-cyan-400">Supreme Authority Dashboard</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm text-green-400 font-semibold">System Status: ACTIVE</div>
                  <div className="text-xs text-purple-400">Quantum Authority Level: SUPREME</div>
                </div>
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-black/80 backdrop-blur-lg border-b border-purple-500/30">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex space-x-1 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = active === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActive(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-semibold whitespace-nowrap transition-colors ${
                      isActive 
                        ? `text-${tab.color}-400 border-${tab.color}-400` 
                        : `text-gray-400 border-transparent hover:text-${tab.color}-400 hover:border-${tab.color}-400`
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="w-full max-w-7xl mx-auto">
            {active === CouncilSection.ELISA_CONTROL && <ElisaControlPanel />}
            {active === CouncilSection.AI_MODELS && <QuantumAIModels />}
            {active === CouncilSection.QUANTUM_UPGRADES && <QuantumUpgrades />}
            {active === CouncilSection.CONSOLE_SECURITY && <ConsoleSecurity />}
            {active === CouncilSection.FINE_SYSTEM && <ElisaFineSystem />}
            {active === CouncilSection.ETHICAL_GOVERNANCE && <EthicalGovernance />}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-black/90 backdrop-blur-lg border-t border-pink-500/30 mt-12">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="text-center">
              <div className="text-pink-400 font-bold text-lg mb-2">ELISA Quantum AI Council</div>
              <div className="text-purple-400 mb-4">© 2025 Ervin Remus Radosavlevici — All Rights Reserved</div>
              <div className="text-sm text-gray-400 mb-2">
                <span className="text-red-400">CONFIDENTIAL</span> — 100-Year NDA Protection — Production v2.0
              </div>
              <div className="text-xs text-cyan-400">
                Authorized Access: ervin210@icloud.com | radosavlevici.ervin@gmail.com
              </div>
              <div className="text-xs text-purple-400 mt-2">
                Timestamp: 2025-08-17 15:50:39 BST — Quantum Authority Level: SUPREME
              </div>
            </div>
          </div>
        </footer>
      </div>
    </OwnerGate>
  );
}
