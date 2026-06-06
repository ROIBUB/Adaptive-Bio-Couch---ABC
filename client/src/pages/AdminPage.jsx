import React, { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import {
  getAllUsers, deleteUser, updateUser,
  getAllWorkoutPlans, deleteWorkoutPlan,
  getAllMealPlans, deleteMealPlan, createUserFull
} from '../services/adminService';
import './AdminPage.css';

const TABS = [
  { key: 'users',    label: 'Users' },
  { key: 'workouts', label: 'Workout Plans' },
  { key: 'meals',    label: 'Meal Plans' },
];

// DataTable is purely presentational (it stringifies every cell), so it can't
// host the per-row Edit/Delete buttons or the inline edit form this page needs.
// Following the codebase's own convention (e.g. WorkoutLogsPage), the interactive
// tables are rendered here while reusing DataTable's .table-wrapper / .data-table
// styles so they look identical.

function AdminPage() {
  const user     = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user?.userRole;
  const canAccess = userRole === 'admin' || userRole === 'manager';
  const isAdmin   = userRole === 'admin'; // only admins may delete

  const [activeTab,    setActiveTab]    = useState('users');
  const [users,        setUsers]        = useState([]);
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [mealPlans,    setMealPlans]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');

  // Inline user edit
  const [editingUserId, setEditingUserId] = useState(null);
  const [editForm,      setEditForm]      = useState({ firstName: '', lastName: '', userRole: '' });
  const [savingEdit,    setSavingEdit]    = useState(false);

  // Add-user form
  const [showAddUser,   setShowAddUser]   = useState(false);
  const [addUserForm,   setAddUserForm]   = useState({
    firstName: '', lastName: '', email: '', password: '',
    age: '', gender: '', height: '', weight: '',
    fitnessGoal: '', activityLevel: '', workoutsPerWeek: '', mealsPerDay: ''
  });
  const [addUserErrors,  setAddUserErrors]  = useState({});
  const [addUserApiError, setAddUserApiError] = useState('');
  const [addUserSaving,  setAddUserSaving]  = useState(false);

  const fetchActiveTab = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'users') {
        setUsers((await getAllUsers()) || []);
      } else if (activeTab === 'workouts') {
        setWorkoutPlans((await getAllWorkoutPlans()) || []);
      } else {
        setMealPlans((await getAllMealPlans()) || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load data. Make sure the backend is running on port 3000.');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (!canAccess) return; // unauthorized — redirect handled in render
    setEditingUserId(null);
    fetchActiveTab();
  }, [fetchActiveTab, canAccess]);

  // Block non-admin/manager users immediately
  if (!canAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  const switchTab = (key) => {
    if (key === activeTab) return;
    setEditingUserId(null);
    setActiveTab(key);
  };

  // ── Users ──────────────────────────────────────────────────────────────────
  const handleDeleteUser = async (u) => {
    if (!window.confirm(`Delete user "${u.firstName} ${u.lastName}" (ID ${u.userid})? This cannot be undone.`)) return;
    setError('');
    try {
      await deleteUser(u.userid);
      fetchActiveTab();
    } catch (err) {
      setError(err.message || 'Failed to delete user.');
    }
  };

  const startEdit = (u) => {
    setEditingUserId(u.userid);
    setEditForm({
      firstName: u.firstName || '',
      lastName:  u.lastName  || '',
      userRole:  u.userRole  || 'user',
    });
  };

  const cancelEdit = () => setEditingUserId(null);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const saveEdit = async (original) => {
    setSavingEdit(true);
    setError('');
    try {
      // The backend PUT validates the full user record, so merge the edited
      // fields onto the original (non-destructive) instead of sending only three.
      await updateUser(original.userid, {
        ...original,
        firstName: editForm.firstName,
        lastName:  editForm.lastName,
        userRole:  editForm.userRole,
      });
      setEditingUserId(null);
      fetchActiveTab();
    } catch (err) {
      setError(err.message || 'Failed to update user.');
    } finally {
      setSavingEdit(false);
    }
  };

  const validateAddUser = () => {
    const f = addUserForm;
    const errs = {};
    if (!f.firstName.trim())  errs.firstName  = 'First name is required';
    if (!f.lastName.trim())   errs.lastName   = 'Last name is required';
    if (!f.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))
      errs.email = 'Valid email is required';
    if (!f.password || f.password.length < 6)
      errs.password = 'Password must be at least 6 characters';
    const age = Number(f.age);
    if (!f.age || isNaN(age) || age < 13 || age > 120)
      errs.age = 'Age must be between 13 and 120';
    if (!f.gender) errs.gender = 'Gender is required';
    const height = Number(f.height);
    if (!f.height || isNaN(height) || height < 100 || height > 250)
      errs.height = 'Height must be between 100 and 250 cm';
    const weight = Number(f.weight);
    if (!f.weight || isNaN(weight) || weight < 30 || weight > 300)
      errs.weight = 'Weight must be between 30 and 300 kg';
    if (!f.fitnessGoal)    errs.fitnessGoal    = 'Fitness goal is required';
    if (!f.activityLevel)  errs.activityLevel  = 'Activity level is required';
    const wpw = Number(f.workoutsPerWeek);
    if (!f.workoutsPerWeek || !Number.isInteger(wpw) || wpw < 1 || wpw > 7)
      errs.workoutsPerWeek = 'Must be a whole number between 1 and 7';
    const mpd = Number(f.mealsPerDay);
    if (!f.mealsPerDay || !Number.isInteger(mpd) || mpd < 1 || mpd > 8)
      errs.mealsPerDay = 'Must be a whole number between 1 and 8';
    return errs;
  };

  const handleAddUserSubmit = async () => {
    const errs = validateAddUser();
    setAddUserErrors(errs);
    setAddUserApiError('');
    if (Object.keys(errs).length > 0) return;

    setAddUserSaving(true);
    try {
      await createUserFull({
        ...addUserForm,
        age:             Number(addUserForm.age),
        height:          Number(addUserForm.height),
        weight:          Number(addUserForm.weight),
        workoutsPerWeek: Number(addUserForm.workoutsPerWeek),
        mealsPerDay:     Number(addUserForm.mealsPerDay),
      });
      // reset and close form, then refresh list
      setAddUserForm({
        firstName: '', lastName: '', email: '', password: '',
        age: '', gender: '', height: '', weight: '',
        fitnessGoal: '', activityLevel: '', workoutsPerWeek: '', mealsPerDay: ''
      });
      setAddUserErrors({});
      setShowAddUser(false);
      fetchActiveTab();
    } catch (err) {
      setAddUserApiError(err.message || 'Failed to create user.');
    } finally {
      setAddUserSaving(false);
    }
  };

  const handleAddUserChange = (e) => {
    const { name, value } = e.target;
    setAddUserForm(prev => ({ ...prev, [name]: value }));
  };

  // ── Plan deletes ────────────────────────────────────────────────────────────
  const handleDeleteWorkoutPlan = async (p) => {
    if (!window.confirm(`Delete workout plan "${p.name}" (ID ${p.workoutPlanId})? This cannot be undone.`)) return;
    setError('');
    try {
      await deleteWorkoutPlan(p.workoutPlanId);
      fetchActiveTab();
    } catch (err) {
      setError(err.message || 'Failed to delete workout plan.');
    }
  };

  const handleDeleteMealPlan = async (p) => {
    if (!window.confirm(`Delete meal plan "${p.name}" (ID ${p.dailyMealPlanId})? This cannot be undone.`)) return;
    setError('');
    try {
      await deleteMealPlan(p.dailyMealPlanId);
      fetchActiveTab();
    } catch (err) {
      setError(err.message || 'Failed to delete meal plan.');
    }
  };

  // ── Renderers ───────────────────────────────────────────────────────────────
  const renderUsers = () => (
    <>
      {!showAddUser && (
        <button
          className="action-btn save"
          style={{ marginBottom: '1.25rem' }}
          onClick={() => { setShowAddUser(true); setAddUserApiError(''); }}
        >
          + Add User
        </button>
      )}

      {showAddUser && (
        <div className="add-user-form">
          <h3 className="add-user-title">New User</h3>

          <div className="add-user-grid">
            <div className="form-group">
              <label>First Name</label>
              <input name="firstName" value={addUserForm.firstName}
                onChange={handleAddUserChange}
                className={addUserErrors.firstName ? 'input-error' : ''} />
              {addUserErrors.firstName && <span className="error-msg">{addUserErrors.firstName}</span>}
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input name="lastName" value={addUserForm.lastName}
                onChange={handleAddUserChange}
                className={addUserErrors.lastName ? 'input-error' : ''} />
              {addUserErrors.lastName && <span className="error-msg">{addUserErrors.lastName}</span>}
            </div>
            <div className="form-group form-group--full">
              <label>Email</label>
              <input name="email" type="email" value={addUserForm.email}
                onChange={handleAddUserChange}
                className={addUserErrors.email ? 'input-error' : ''} />
              {addUserErrors.email && <span className="error-msg">{addUserErrors.email}</span>}
            </div>
            <div className="form-group form-group--full">
              <label>Password</label>
              <input name="password" type="password" value={addUserForm.password}
                onChange={handleAddUserChange}
                className={addUserErrors.password ? 'input-error' : ''} />
              {addUserErrors.password && <span className="error-msg">{addUserErrors.password}</span>}
            </div>
            <div className="form-group">
              <label>Age</label>
              <input name="age" type="number" value={addUserForm.age}
                onChange={handleAddUserChange}
                className={addUserErrors.age ? 'input-error' : ''} />
              {addUserErrors.age && <span className="error-msg">{addUserErrors.age}</span>}
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select name="gender" value={addUserForm.gender} onChange={handleAddUserChange}
                className={addUserErrors.gender ? 'input-error' : ''}>
                <option value="">Select…</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              {addUserErrors.gender && <span className="error-msg">{addUserErrors.gender}</span>}
            </div>
            <div className="form-group">
              <label>Height (cm)</label>
              <input name="height" type="number" value={addUserForm.height}
                onChange={handleAddUserChange}
                className={addUserErrors.height ? 'input-error' : ''} />
              {addUserErrors.height && <span className="error-msg">{addUserErrors.height}</span>}
            </div>
            <div className="form-group">
              <label>Weight (kg)</label>
              <input name="weight" type="number" value={addUserForm.weight}
                onChange={handleAddUserChange}
                className={addUserErrors.weight ? 'input-error' : ''} />
              {addUserErrors.weight && <span className="error-msg">{addUserErrors.weight}</span>}
            </div>
            <div className="form-group">
              <label>Fitness Goal</label>
              <select name="fitnessGoal" value={addUserForm.fitnessGoal} onChange={handleAddUserChange}
                className={addUserErrors.fitnessGoal ? 'input-error' : ''}>
                <option value="">Select…</option>
                <option value="weight_loss">Weight Loss</option>
                <option value="muscle_gain">Muscle Gain</option>
                <option value="maintenance">Maintenance</option>
              </select>
              {addUserErrors.fitnessGoal && <span className="error-msg">{addUserErrors.fitnessGoal}</span>}
            </div>
            <div className="form-group">
              <label>Activity Level</label>
              <select name="activityLevel" value={addUserForm.activityLevel} onChange={handleAddUserChange}
                className={addUserErrors.activityLevel ? 'input-error' : ''}>
                <option value="">Select…</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              {addUserErrors.activityLevel && <span className="error-msg">{addUserErrors.activityLevel}</span>}
            </div>
            <div className="form-group">
              <label>Workouts / Week</label>
              <input name="workoutsPerWeek" type="number" value={addUserForm.workoutsPerWeek}
                onChange={handleAddUserChange}
                className={addUserErrors.workoutsPerWeek ? 'input-error' : ''} />
              {addUserErrors.workoutsPerWeek && <span className="error-msg">{addUserErrors.workoutsPerWeek}</span>}
            </div>
            <div className="form-group">
              <label>Meals / Day</label>
              <input name="mealsPerDay" type="number" value={addUserForm.mealsPerDay}
                onChange={handleAddUserChange}
                className={addUserErrors.mealsPerDay ? 'input-error' : ''} />
              {addUserErrors.mealsPerDay && <span className="error-msg">{addUserErrors.mealsPerDay}</span>}
            </div>
          </div>

          {addUserApiError && <div className="api-error">{addUserApiError}</div>}

          <div className="add-user-actions">
            <button className="action-btn save" disabled={addUserSaving} onClick={handleAddUserSubmit}>
              {addUserSaving ? 'Creating…' : 'Create User'}
            </button>
            <button className="action-btn cancel" disabled={addUserSaving}
              onClick={() => { setShowAddUser(false); setAddUserErrors({}); setAddUserApiError(''); }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Role</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <React.Fragment key={u.userid}>
              <tr>
                <td>{u.userid}</td>
                <td>{u.firstName}</td>
                <td>{u.lastName}</td>
                <td>{u.userRole}</td>
                <td>{u.createDate ? String(u.createDate).split('T')[0] : '—'}</td>
                <td>
                  <button className="action-btn edit" onClick={() => startEdit(u)}>Edit</button>
                  {isAdmin && (
                    <button className="action-btn delete" onClick={() => handleDeleteUser(u)}>Delete</button>
                  )}
                </td>
              </tr>
              {editingUserId === u.userid && (
                <tr>
                  <td colSpan={6}>
                    <div className="inline-edit-form">
                      <input
                        name="firstName" value={editForm.firstName}
                        onChange={handleEditChange} placeholder="First name" aria-label="First name"
                      />
                      <input
                        name="lastName" value={editForm.lastName}
                        onChange={handleEditChange} placeholder="Last name" aria-label="Last name"
                      />
                      <select
                        name="userRole" value={editForm.userRole}
                        onChange={handleEditChange} aria-label="Role"
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                        <option value="manager">manager</option>
                      </select>
                      <button className="action-btn save" disabled={savingEdit} onClick={() => saveEdit(u)}>
                        {savingEdit ? 'Saving…' : 'Save'}
                      </button>
                      <button className="action-btn cancel" disabled={savingEdit} onClick={cancelEdit}>
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
      </div>
    </>
  );

  const renderWorkoutPlans = () => (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Goal</th>
            <th>User ID</th>
            {isAdmin && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {workoutPlans.map(p => (
            <tr key={p.workoutPlanId}>
              <td>{p.workoutPlanId}</td>
              <td>{p.name}</td>
              <td>{p.goal}</td>
              <td>{p.userId}</td>
              {isAdmin && (
                <td>
                  <button className="action-btn delete" onClick={() => handleDeleteWorkoutPlan(p)}>Delete</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderMealPlans = () => (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Goal</th>
            <th>Target Calories</th>
            <th>User ID</th>
            {isAdmin && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {mealPlans.map(p => (
            <tr key={p.dailyMealPlanId}>
              <td>{p.dailyMealPlanId}</td>
              <td>{p.name}</td>
              <td>{p.goal}</td>
              <td>{p.targetCalories}</td>
              <td>{p.userId}</td>
              {isAdmin && (
                <td>
                  <button className="action-btn delete" onClick={() => handleDeleteMealPlan(p)}>Delete</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const tabHasData =
    (activeTab === 'users'    && users.length        > 0) ||
    (activeTab === 'workouts' && workoutPlans.length > 0) ||
    (activeTab === 'meals'    && mealPlans.length    > 0);

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <p>Manage users, workout plans, and meal plans</p>
      </div>

      <div className="admin-tabs">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`tab-btn${activeTab === t.key ? ' active' : ''}`}
            onClick={() => switchTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="admin-table-section">
        {loading && <p className="loading">Loading…</p>}
        {error   && <div className="error-banner">{error}</div>}

        {!loading && !error && !tabHasData && (
          <p className="table-empty">No data to display.</p>
        )}

        {!loading && !error && tabHasData && (
          <>
            {activeTab === 'users'    && renderUsers()}
            {activeTab === 'workouts' && renderWorkoutPlans()}
            {activeTab === 'meals'    && renderMealPlans()}
          </>
        )}
      </div>
    </div>
  );
}

export default AdminPage;
