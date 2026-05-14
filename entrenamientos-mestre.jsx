import React, { useState, useEffect } from 'react';
import { Users, Dumbbell, BarChart3, Plus, Trash2, Edit2, X, ChevronRight, Calendar, TrendingUp, Activity, Target, Flame, Award, Save, ArrowLeft, User, Phone, Mail, Zap } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function EntrenamientosMestre() {
  const [section, setSection] = useState('inicio');
  const [clients, setClients] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [showClientForm, setShowClientForm] = useState(false);
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar datos
  useEffect(() => {
    const load = async () => {
      try {
        const c = await window.storage.get('clients');
        if (c) setClients(JSON.parse(c.value));
      } catch (e) {}
      try {
        const w = await window.storage.get('workouts');
        if (w) setWorkouts(JSON.parse(w.value));
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, []);

  // Guardar clientes
  const saveClients = async (newClients) => {
    setClients(newClients);
    try {
      await window.storage.set('clients', JSON.stringify(newClients));
    } catch (e) { console.error(e); }
  };

  // Guardar entrenamientos
  const saveWorkouts = async (newWorkouts) => {
    setWorkouts(newWorkouts);
    try {
      await window.storage.set('workouts', JSON.stringify(newWorkouts));
    } catch (e) { console.error(e); }
  };

  const addClient = (client) => {
    const newClient = { ...client, id: Date.now().toString(), createdAt: new Date().toISOString() };
    saveClients([...clients, newClient]);
    setShowClientForm(false);
  };

  const deleteClient = (id) => {
    if (confirm('¿Eliminar este cliente y todos sus entrenamientos?')) {
      saveClients(clients.filter(c => c.id !== id));
      saveWorkouts(workouts.filter(w => w.clientId !== id));
      if (selectedClient?.id === id) setSelectedClient(null);
    }
  };

  const addWorkout = (workout) => {
    if (editingWorkout) {
      saveWorkouts(workouts.map(w => w.id === editingWorkout.id ? { ...workout, id: editingWorkout.id } : w));
      setEditingWorkout(null);
    } else {
      const newWorkout = { ...workout, id: Date.now().toString(), createdAt: new Date().toISOString() };
      saveWorkouts([...workouts, newWorkout]);
    }
    setShowWorkoutForm(false);
  };

  const deleteWorkout = (id) => {
    if (confirm('¿Eliminar este entrenamiento?')) {
      saveWorkouts(workouts.filter(w => w.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-lime-400 text-xl font-bold animate-pulse">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 border-b border-lime-500/20 sticky top-0 z-40 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-lime-400 to-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-lime-500/30">
              <Flame className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-black tracking-tight">ENTRENAMIENTOS MESTRE</h1>
              <p className="text-[10px] md:text-xs text-lime-400 font-semibold tracking-wider">FUNCTIONAL · TRX · PERFORMANCE</p>
            </div>
          </div>
        </div>
        {/* Nav */}
        <nav className="max-w-7xl mx-auto px-4 pb-2 flex gap-1 overflow-x-auto">
          {[
            { id: 'inicio', icon: Activity, label: 'Inicio' },
            { id: 'clientes', icon: Users, label: 'Clientes' },
            { id: 'entrenamientos', icon: Dumbbell, label: 'Entrenamientos' },
            { id: 'analiticas', icon: BarChart3, label: 'Analíticas' },
          ].map(item => {
            const Icon = item.icon;
            const active = section === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setSection(item.id); setSelectedClient(null); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
                  active
                    ? 'bg-lime-400 text-slate-950 shadow-lg shadow-lime-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6">
        {section === 'inicio' && <Inicio clients={clients} workouts={workouts} setSection={setSection} />}
        {section === 'clientes' && (
          selectedClient ? (
            <ClientDetail
              client={selectedClient}
              workouts={workouts.filter(w => w.clientId === selectedClient.id)}
              onBack={() => setSelectedClient(null)}
              onAddWorkout={() => { setEditingWorkout(null); setShowWorkoutForm(true); }}
              onEditWorkout={(w) => { setEditingWorkout(w); setShowWorkoutForm(true); }}
              onDeleteWorkout={deleteWorkout}
              onDeleteClient={() => deleteClient(selectedClient.id)}
            />
          ) : (
            <Clientes
              clients={clients}
              workouts={workouts}
              onAdd={() => setShowClientForm(true)}
              onSelect={setSelectedClient}
              onDelete={deleteClient}
            />
          )
        )}
        {section === 'entrenamientos' && (
          <Entrenamientos
            workouts={workouts}
            clients={clients}
            onAdd={() => { setEditingWorkout(null); setShowWorkoutForm(true); }}
            onEdit={(w) => { setEditingWorkout(w); setShowWorkoutForm(true); }}
            onDelete={deleteWorkout}
          />
        )}
        {section === 'analiticas' && <Analiticas clients={clients} workouts={workouts} />}
      </main>

      {showClientForm && <ClientForm onSave={addClient} onClose={() => setShowClientForm(false)} />}
      {showWorkoutForm && (
        <WorkoutForm
          clients={clients}
          preselectedClient={selectedClient}
          editing={editingWorkout}
          onSave={addWorkout}
          onClose={() => { setShowWorkoutForm(false); setEditingWorkout(null); }}
        />
      )}
    </div>
  );
}

// ============ INICIO ============
function Inicio({ clients, workouts, setSection }) {
  const activeClients = clients.length;
  const totalWorkouts = workouts.length;
  const thisWeek = workouts.filter(w => {
    const d = new Date(w.date);
    const now = new Date();
    const diff = (now - d) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  }).length;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-lime-400 to-emerald-600 rounded-2xl p-6 md:p-8 shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-5 h-5 text-slate-950" />
          <span className="text-slate-950 font-bold text-sm tracking-wider">PANEL DEL ENTRENADOR</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-slate-950 mb-2">¡Vamos al lío!</h2>
        <p className="text-slate-900 font-medium">Gestiona tus clientes, planifica entrenamientos y analiza progresos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={Users} value={activeClients} label="Clientes activos" color="lime" />
        <StatCard icon={Dumbbell} value={totalWorkouts} label="Entrenamientos totales" color="emerald" />
        <StatCard icon={Calendar} value={thisWeek} label="Esta semana" color="cyan" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => setSection('clientes')}
          className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-lime-500/50 rounded-2xl p-6 text-left transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-lime-400/10 rounded-xl flex items-center justify-center group-hover:bg-lime-400/20 transition">
              <Users className="w-6 h-6 text-lime-400" />
            </div>
            <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-lime-400 transition" />
          </div>
          <h3 className="text-lg font-bold mb-1">Gestionar clientes</h3>
          <p className="text-sm text-slate-400">Añade nuevos clientes y consulta su ficha personal.</p>
        </button>

        <button
          onClick={() => setSection('entrenamientos')}
          className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-lime-500/50 rounded-2xl p-6 text-left transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-emerald-400/10 rounded-xl flex items-center justify-center group-hover:bg-emerald-400/20 transition">
              <Dumbbell className="w-6 h-6 text-emerald-400" />
            </div>
            <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-400 transition" />
          </div>
          <h3 className="text-lg font-bold mb-1">Planificar entrenamientos</h3>
          <p className="text-sm text-slate-400">Crea rutinas personalizadas de funcional y TRX.</p>
        </button>
      </div>

      {workouts.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-lime-400" />
            Últimos entrenamientos
          </h3>
          <div className="space-y-2">
            {workouts.slice(-5).reverse().map(w => {
              const client = clients.find(c => c.id === w.clientId);
              return (
                <div key={w.id} className="flex items-center justify-between p-3 bg-slate-950 rounded-lg">
                  <div>
                    <div className="font-semibold">{w.name}</div>
                    <div className="text-xs text-slate-400">{client?.name || 'Cliente eliminado'} · {new Date(w.date).toLocaleDateString('es-ES')}</div>
                  </div>
                  <div className="text-xs text-lime-400 font-semibold">{w.exercises?.length || 0} ej.</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, value, label, color }) {
  const colors = {
    lime: 'from-lime-400/20 to-lime-600/5 border-lime-500/30 text-lime-400',
    emerald: 'from-emerald-400/20 to-emerald-600/5 border-emerald-500/30 text-emerald-400',
    cyan: 'from-cyan-400/20 to-cyan-600/5 border-cyan-500/30 text-cyan-400',
  };
  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-2xl p-5`}>
      <Icon className={`w-8 h-8 mb-3`} />
      <div className="text-3xl font-black">{value}</div>
      <div className="text-sm text-slate-300 font-medium">{label}</div>
    </div>
  );
}

// ============ CLIENTES ============
function Clientes({ clients, workouts, onAdd, onSelect, onDelete }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-black">Clientes</h2>
          <p className="text-slate-400 text-sm">{clients.length} {clients.length === 1 ? 'cliente' : 'clientes'}</p>
        </div>
        <button onClick={onAdd} className="bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-lime-500/30 transition">
          <Plus className="w-5 h-5" /> <span className="hidden sm:inline">Nuevo cliente</span>
        </button>
      </div>

      {clients.length === 0 ? (
        <EmptyState icon={Users} title="Aún no hay clientes" text="Añade a tu primer cliente para empezar a planificar entrenamientos." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map(client => {
            const clientWorkouts = workouts.filter(w => w.clientId === client.id);
            return (
              <div
                key={client.id}
                onClick={() => onSelect(client)}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-lime-500/50 rounded-2xl p-5 cursor-pointer transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-lime-400 to-emerald-500 rounded-xl flex items-center justify-center text-slate-950 font-black text-xl shadow-lg">
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(client.id); }}
                    className="text-slate-600 hover:text-red-400 p-1 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="font-bold text-lg mb-1">{client.name}</h3>
                {client.goal && <p className="text-xs text-lime-400 font-semibold mb-2">{client.goal}</p>}
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{clientWorkouts.length} entrenamientos</span>
                  <ChevronRight className="w-4 h-4 group-hover:text-lime-400 transition" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============ DETALLE CLIENTE ============
function ClientDetail({ client, workouts, onBack, onAddWorkout, onEditWorkout, onDeleteWorkout, onDeleteClient }) {
  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-lime-400 text-sm font-semibold transition">
        <ArrowLeft className="w-4 h-4" /> Volver a clientes
      </button>

      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 bg-gradient-to-br from-lime-400 to-emerald-500 rounded-2xl flex items-center justify-center text-slate-950 font-black text-3xl shadow-xl">
            {client.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-black mb-1">{client.name}</h2>
            {client.goal && (
              <div className="inline-flex items-center gap-1 bg-lime-400/10 text-lime-400 px-3 py-1 rounded-full text-xs font-bold mb-3">
                <Target className="w-3 h-3" /> {client.goal}
              </div>
            )}
            <div className="space-y-1 text-sm text-slate-300">
              {client.age && <div>🎂 {client.age} años</div>}
              {client.phone && <div className="flex items-center gap-2"><Phone className="w-3 h-3" /> {client.phone}</div>}
              {client.email && <div className="flex items-center gap-2"><Mail className="w-3 h-3" /> {client.email}</div>}
              {client.notes && <div className="text-slate-400 italic mt-2">"{client.notes}"</div>}
            </div>
          </div>
          <button onClick={onDeleteClient} className="text-slate-500 hover:text-red-400 p-2">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Entrenamientos de {client.name.split(' ')[0]}</h3>
        <button onClick={onAddWorkout} className="bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-lime-500/30 transition">
          <Plus className="w-5 h-5" /> <span className="hidden sm:inline">Nuevo</span>
        </button>
      </div>

      {workouts.length === 0 ? (
        <EmptyState icon={Dumbbell} title="Sin entrenamientos" text={`Diseña el primer entrenamiento personalizado para ${client.name.split(' ')[0]}.`} />
      ) : (
        <div className="space-y-3">
          {workouts.slice().reverse().map(w => (
            <WorkoutCard key={w.id} workout={w} onEdit={() => onEditWorkout(w)} onDelete={() => onDeleteWorkout(w.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

// ============ ENTRENAMIENTOS ============
function Entrenamientos({ workouts, clients, onAdd, onEdit, onDelete }) {
  const [filterClient, setFilterClient] = useState('all');
  const filtered = filterClient === 'all' ? workouts : workouts.filter(w => w.clientId === filterClient);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-black">Entrenamientos</h2>
          <p className="text-slate-400 text-sm">{filtered.length} {filtered.length === 1 ? 'rutina' : 'rutinas'}</p>
        </div>
        <button
          onClick={onAdd}
          disabled={clients.length === 0}
          className="bg-lime-400 hover:bg-lime-300 disabled:bg-slate-700 disabled:text-slate-500 text-slate-950 font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-lime-500/30 transition"
        >
          <Plus className="w-5 h-5" /> <span className="hidden sm:inline">Nuevo</span>
        </button>
      </div>

      {clients.length === 0 ? (
        <EmptyState icon={Users} title="Primero añade clientes" text="Necesitas tener al menos un cliente para crear entrenamientos." />
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setFilterClient('all')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition ${filterClient === 'all' ? 'bg-lime-400 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              Todos
            </button>
            {clients.map(c => (
              <button
                key={c.id}
                onClick={() => setFilterClient(c.id)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition ${filterClient === c.id ? 'bg-lime-400 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={Dumbbell} title="Sin entrenamientos" text="Crea el primer entrenamiento desde el botón de arriba." />
          ) : (
            <div className="space-y-3">
              {filtered.slice().reverse().map(w => {
                const client = clients.find(c => c.id === w.clientId);
                return <WorkoutCard key={w.id} workout={w} clientName={client?.name} onEdit={() => onEdit(w)} onDelete={() => onDelete(w.id)} />;
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function WorkoutCard({ workout, clientName, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const typeColors = {
    'Funcional': 'bg-lime-400/10 text-lime-400 border-lime-500/30',
    'TRX': 'bg-cyan-400/10 text-cyan-400 border-cyan-500/30',
    'Mixto': 'bg-emerald-400/10 text-emerald-400 border-emerald-500/30',
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-lime-500/30 transition">
      <div className="p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeColors[workout.type] || typeColors.Funcional}`}>
                {workout.type || 'Funcional'}
              </span>
              <span className="text-xs text-slate-500">{new Date(workout.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
            <h3 className="font-bold text-lg mb-1 truncate">{workout.name}</h3>
            {clientName && <p className="text-xs text-slate-400 mb-2">👤 {clientName}</p>}
            <div className="flex flex-wrap gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1"><Dumbbell className="w-3 h-3" /> {workout.exercises?.length || 0} ejercicios</span>
              {workout.duration && <span className="flex items-center gap-1">⏱️ {workout.duration} min</span>}
            </div>
          </div>
          <div className="flex gap-1">
            <button onClick={onEdit} className="p-2 text-slate-400 hover:text-lime-400 transition">
              <Edit2 className="w-4 h-4" />
            </button>
            <button onClick={onDelete} className="p-2 text-slate-400 hover:text-red-400 transition">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {workout.exercises && workout.exercises.length > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 text-xs font-semibold text-lime-400 hover:text-lime-300 transition flex items-center gap-1"
          >
            {expanded ? 'Ocultar' : 'Ver'} ejercicios
            <ChevronRight className={`w-3 h-3 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </button>
        )}
      </div>

      {expanded && workout.exercises && (
        <div className="bg-slate-950 border-t border-slate-800 p-4 space-y-2">
          {workout.exercises.map((ex, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-slate-900 rounded-lg">
              <div className="w-8 h-8 bg-lime-400/10 text-lime-400 rounded-lg flex items-center justify-center font-bold text-sm">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{ex.name}</div>
                <div className="text-xs text-slate-400 flex flex-wrap gap-2">
                  <span>📊 {ex.sets} series</span>
                  <span>🔁 {ex.reps} reps</span>
                  {ex.weight > 0 && <span>🏋️ {ex.weight} kg</span>}
                  {ex.rest && <span>⏸️ {ex.rest}s</span>}
                </div>
                {ex.notes && <div className="text-xs text-slate-500 italic mt-1">{ex.notes}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ ANALÍTICAS ============
function Analiticas({ clients, workouts }) {
  // Datos por mes
  const monthlyData = {};
  workouts.forEach(w => {
    const d = new Date(w.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthlyData[key] = (monthlyData[key] || 0) + 1;
  });
  const monthlyChart = Object.entries(monthlyData).sort().slice(-6).map(([k, v]) => {
    const [y, m] = k.split('-');
    const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    return { month: months[parseInt(m) - 1], entrenamientos: v };
  });

  // Por tipo
  const typeCount = { Funcional: 0, TRX: 0, Mixto: 0 };
  workouts.forEach(w => {
    typeCount[w.type || 'Funcional'] = (typeCount[w.type || 'Funcional'] || 0) + 1;
  });
  const typeData = Object.entries(typeCount).filter(([_, v]) => v > 0).map(([name, value]) => ({ name, value }));
  const COLORS = ['#a3e635', '#22d3ee', '#34d399'];

  // Top clientes
  const clientCount = {};
  workouts.forEach(w => {
    clientCount[w.clientId] = (clientCount[w.clientId] || 0) + 1;
  });
  const topClients = Object.entries(clientCount)
    .map(([id, count]) => ({ name: clients.find(c => c.id === id)?.name || 'N/A', count }))
    .filter(c => c.name !== 'N/A')
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Total kilos movidos
  let totalKg = 0;
  workouts.forEach(w => {
    w.exercises?.forEach(ex => {
      totalKg += (ex.sets || 0) * (ex.reps || 0) * (ex.weight || 0);
    });
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-black">Analíticas</h2>
        <p className="text-slate-400 text-sm">Visualiza la actividad de tu negocio</p>
      </div>

      {workouts.length === 0 ? (
        <EmptyState icon={BarChart3} title="Sin datos aún" text="Las analíticas aparecerán cuando registres entrenamientos." />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MiniStat icon={Users} label="Clientes" value={clients.length} />
            <MiniStat icon={Dumbbell} label="Sesiones" value={workouts.length} />
            <MiniStat icon={TrendingUp} label="Kilos movidos" value={totalKg.toLocaleString('es-ES')} suffix="kg" />
            <MiniStat icon={Award} label="Promedio/cliente" value={clients.length ? (workouts.length / clients.length).toFixed(1) : 0} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {monthlyChart.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-lime-400" />
                  Entrenamientos por mes
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={monthlyChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="entrenamientos" stroke="#a3e635" strokeWidth={3} dot={{ fill: '#a3e635', r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {typeData.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-lime-400" />
                  Por tipo de entrenamiento
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={typeData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={(e) => `${e.name}: ${e.value}`}>
                      {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {topClients.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-lime-400" />
                Top clientes más activos
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={topClients} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" stroke="#64748b" style={{ fontSize: '12px' }} />
                  <YAxis type="category" dataKey="name" stroke="#64748b" style={{ fontSize: '12px' }} width={100} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="#a3e635" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, suffix }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <Icon className="w-5 h-5 text-lime-400 mb-2" />
      <div className="text-xl md:text-2xl font-black truncate">{value}{suffix && <span className="text-sm text-slate-400 ml-1">{suffix}</span>}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, text }) {
  return (
    <div className="bg-slate-900 border border-slate-800 border-dashed rounded-2xl p-10 text-center">
      <Icon className="w-12 h-12 text-slate-700 mx-auto mb-3" />
      <h3 className="font-bold text-lg mb-1">{title}</h3>
      <p className="text-sm text-slate-400">{text}</p>
    </div>
  );
}

// ============ FORMULARIO CLIENTE ============
function ClientForm({ onSave, onClose }) {
  const [form, setForm] = useState({ name: '', age: '', phone: '', email: '', goal: '', notes: '' });

  const handleSubmit = () => {
    if (!form.name.trim()) return alert('El nombre es obligatorio');
    onSave(form);
  };

  return (
    <Modal title="Nuevo cliente" onClose={onClose}>
      <div className="space-y-3">
        <Input label="Nombre completo *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Ej: María García" />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Edad" value={form.age} onChange={(v) => setForm({ ...form, age: v })} type="number" placeholder="30" />
          <Input label="Teléfono" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="600 000 000" />
        </div>
        <Input label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" placeholder="email@ejemplo.com" />
        <Input label="Objetivo" value={form.goal} onChange={(v) => setForm({ ...form, goal: v })} placeholder="Ej: Perder peso, ganar fuerza..." />
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1">Notas</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={3}
            className="w-full bg-slate-950 border border-slate-700 focus:border-lime-500 rounded-lg px-3 py-2 text-sm outline-none transition resize-none"
            placeholder="Lesiones, preferencias, observaciones..."
          />
        </div>
        <button onClick={handleSubmit} className="w-full bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition mt-4">
          <Save className="w-5 h-5" /> Guardar cliente
        </button>
      </div>
    </Modal>
  );
}

// ============ FORMULARIO ENTRENAMIENTO ============
function WorkoutForm({ clients, preselectedClient, editing, onSave, onClose }) {
  const [form, setForm] = useState(editing || {
    clientId: preselectedClient?.id || clients[0]?.id || '',
    name: '',
    type: 'Funcional',
    date: new Date().toISOString().split('T')[0],
    duration: 60,
    exercises: [],
    notes: '',
  });

  const addExercise = () => {
    setForm({
      ...form,
      exercises: [...form.exercises, { name: '', sets: 3, reps: 12, weight: 0, rest: 60, notes: '' }],
    });
  };

  const updateExercise = (i, field, value) => {
    const updated = [...form.exercises];
    updated[i] = { ...updated[i], [field]: value };
    setForm({ ...form, exercises: updated });
  };

  const removeExercise = (i) => {
    setForm({ ...form, exercises: form.exercises.filter((_, idx) => idx !== i) });
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return alert('El nombre del entrenamiento es obligatorio');
    if (!form.clientId) return alert('Selecciona un cliente');
    if (form.exercises.length === 0) return alert('Añade al menos un ejercicio');
    if (form.exercises.some(e => !e.name.trim())) return alert('Todos los ejercicios necesitan un nombre');
    onSave(form);
  };

  return (
    <Modal title={editing ? 'Editar entrenamiento' : 'Nuevo entrenamiento'} onClose={onClose}>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1">Cliente *</label>
          <select
            value={form.clientId}
            onChange={(e) => setForm({ ...form, clientId: e.target.value })}
            className="w-full bg-slate-950 border border-slate-700 focus:border-lime-500 rounded-lg px-3 py-2 text-sm outline-none transition"
          >
            <option value="">Selecciona un cliente</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <Input label="Nombre del entrenamiento *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Ej: Full body TRX - Día 1" />

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">Tipo</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 focus:border-lime-500 rounded-lg px-3 py-2 text-sm outline-none transition"
            >
              <option>Funcional</option>
              <option>TRX</option>
              <option>Mixto</option>
            </select>
          </div>
          <Input label="Fecha" value={form.date} onChange={(v) => setForm({ ...form, date: v })} type="date" />
          <Input label="Duración (min)" value={form.duration} onChange={(v) => setForm({ ...form, duration: v })} type="number" />
        </div>

        {/* Ejercicios */}
        <div className="pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold flex items-center gap-2"><Dumbbell className="w-4 h-4 text-lime-400" /> Ejercicios</h4>
            <button onClick={addExercise} className="text-xs bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition">
              <Plus className="w-3 h-3" /> Añadir
            </button>
          </div>

          {form.exercises.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-4">Aún no hay ejercicios. Pulsa "Añadir" para empezar.</p>
          )}

          <div className="space-y-3">
            {form.exercises.map((ex, i) => (
              <div key={i} className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 bg-lime-400/10 text-lime-400 rounded text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  <input
                    type="text"
                    value={ex.name}
                    onChange={(e) => updateExercise(i, 'name', e.target.value)}
                    placeholder="Nombre del ejercicio (ej: Sentadilla TRX)"
                    className="flex-1 bg-slate-900 border border-slate-700 focus:border-lime-500 rounded px-2 py-1.5 text-sm outline-none"
                  />
                  <button onClick={() => removeExercise(i)} className="text-slate-500 hover:text-red-400 p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <MiniInput label="Series" value={ex.sets} onChange={(v) => updateExercise(i, 'sets', parseInt(v) || 0)} />
                  <MiniInput label="Reps" value={ex.reps} onChange={(v) => updateExercise(i, 'reps', parseInt(v) || 0)} />
                  <MiniInput label="Kg" value={ex.weight} onChange={(v) => updateExercise(i, 'weight', parseFloat(v) || 0)} step="0.5" />
                  <MiniInput label="Desc.(s)" value={ex.rest} onChange={(v) => updateExercise(i, 'rest', parseInt(v) || 0)} />
                </div>
                <input
                  type="text"
                  value={ex.notes}
                  onChange={(e) => updateExercise(i, 'notes', e.target.value)}
                  placeholder="Notas (opcional)"
                  className="w-full mt-2 bg-slate-900 border border-slate-700 focus:border-lime-500 rounded px-2 py-1 text-xs outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleSubmit} className="w-full bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition mt-4">
          <Save className="w-5 h-5" /> {editing ? 'Guardar cambios' : 'Crear entrenamiento'}
        </button>
      </div>
    </Modal>
  );
}

// ============ UI HELPERS ============
function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between z-10">
          <h3 className="font-black text-lg">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-300 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-950 border border-slate-700 focus:border-lime-500 rounded-lg px-3 py-2 text-sm outline-none transition"
      />
    </div>
  );
}

function MiniInput({ label, value, onChange, step }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{label}</label>
      <input
        type="number"
        value={value}
        step={step}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-900 border border-slate-700 focus:border-lime-500 rounded px-2 py-1.5 text-sm outline-none transition"
      />
    </div>
  );
}
