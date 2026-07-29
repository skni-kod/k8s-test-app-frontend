import { useEffect, useMemo, useState } from 'react';

const apiBaseUrl = '/api';

export default function App() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const title = useMemo(() => `Użytkownicy (${users.length})`, [users.length]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/users`);
        if (!response.ok) {
          throw new Error('Nie udało się pobrać listy użytkowników.');
        }

        const data = await response.json();
        setUsers(Array.isArray(data.users) ? data.users : []);
      } catch (fetchError) {
        setError(fetchError.message);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Podaj imię i nazwisko użytkownika.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await fetch(`${apiBaseUrl}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: trimmedName }),
      });

      if (!response.ok) {
        throw new Error('Nie udało się dodać użytkownika.');
      }

      const createdUser = await response.json();
      setUsers((currentUsers) => [...currentUsers, createdUser]);
      setName('');
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (userId) => {
    setError('');

    try {
      const response = await fetch(`${apiBaseUrl}/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok && response.status !== 204) {
        throw new Error('Nie udało się usunąć użytkownika.');
      }

      setUsers((currentUsers) => currentUsers.filter((user) => user.id !== userId));
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  return (
    <main className="shell">
      <section className="panel hero">
        <p className="eyebrow">Simple K8s demo</p>
        <h1>Lista użytkowników</h1>
        <p className="subtitle">
          Lekki frontend React z prostym backendem Node.js. Dodawaj i usuwaj rekordy bez przeładowania strony.
        </p>
      </section>

      <section className="panel form-panel">
        <form onSubmit={handleSubmit} className="user-form">
          <label htmlFor="name">Nowy użytkownik</label>
          <div className="form-row">
            <input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Np. Anna Kowalska"
              autoComplete="off"
            />
            <button type="submit" disabled={saving}>
              {saving ? 'Dodawanie...' : 'Dodaj'}
            </button>
          </div>
        </form>
        {error ? <p className="error">{error}</p> : null}
      </section>

      <section className="panel list-panel">
        <div className="list-header">
          <h2>{title}</h2>
          <span>{loading ? 'Ładowanie...' : 'Gotowe'}</span>
        </div>

        {loading ? (
          <p className="empty-state">Pobieranie użytkowników z backendu...</p>
        ) : users.length === 0 ? (
          <p className="empty-state">Brak użytkowników. Dodaj pierwszy wpis.</p>
        ) : (
          <ul className="user-list">
            {users.map((user) => (
              <li key={user.id} className="user-card">
                <div>
                  <p className="user-name">{user.name}</p>
                  <p className="user-id">ID {user.id}</p>
                </div>
                <button type="button" className="delete-button" onClick={() => handleDelete(user.id)}>
                  Usuń
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
