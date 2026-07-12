'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { API_BASE_URL } from '@/lib/api';

export default function AdminDashboard() {
    const router = useRouter();
    const { token, user } = useAuthStore();
    const [createForm, setCreateForm] = useState({
        full_name: '',
        role: 'admin',
    });
    const [creatingAdmin, setCreatingAdmin] = useState(false);
    const [createMessage, setCreateMessage] = useState('');
    const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string } | null>(null);

    // Users state
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Subjects state
    const [subjects, setSubjects] = useState<any[]>([]);
    const [subjectForm, setSubjectForm] = useState({ name: '', description: '' });
    const [creatingSubject, setCreatingSubject] = useState(false);
    const [subjectGroups, setSubjectGroups] = useState<any[]>([]);
    const [linkingForm, setLinkingForm] = useState({ subject_id: '', group_id: '' });

    // Groups state
    const [groups, setGroups] = useState<any[]>([]);
    const [groupForm, setGroupForm] = useState({ name: '', description: '' });
    const [creatingGroup, setCreatingGroup] = useState(false);

    // Lesson Scripts state
    const [lessonScripts, setLessonScripts] = useState<any[]>([]);
    const [scriptForm, setScriptForm] = useState({ subject_id: '', content: '' });
    const [creatingScript, setCreatingScript] = useState(false);

    // Student Progress state
    const [studentProgress, setStudentProgress] = useState<any[]>([]);

    useEffect(() => {
        if (!token) {
            router.push('/admin/auth');
            return;
        }

        const fetchData = async () => {
            try {
                // Fetch users
                const usersResponse = await fetch(`${API_BASE_URL}/api/v1/admin/users/list`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                const usersData = await usersResponse.json();
                if (usersData.success) setUsers(usersData.data);

                // Fetch subjects
                const subjectsResponse = await fetch(`${API_BASE_URL}/api/v1/admin/subjects`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                const subjectsData = await subjectsResponse.json();
                if (subjectsData.success) setSubjects(subjectsData.data);

                // Fetch groups
                const groupsResponse = await fetch(`${API_BASE_URL}/api/v1/admin/groups`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                const groupsData = await groupsResponse.json();
                if (groupsData.success) setGroups(groupsData.data);

                // Fetch lesson scripts
                const scriptsResponse = await fetch(`${API_BASE_URL}/api/v1/admin/lesson-scripts`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                const scriptsData = await scriptsResponse.json();
                if (scriptsData.success) setLessonScripts(scriptsData.data);

                // Fetch student progress
                const progressResponse = await fetch(`${API_BASE_URL}/api/v1/admin/student-progress`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                const progressData = await progressResponse.json();
                if (progressData.success) setStudentProgress(progressData.data);

                // Fetch subject groups
                const subjectGroupsResponse = await fetch(`${API_BASE_URL}/api/v1/admin/subject-groups`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                const subjectGroupsData = await subjectGroupsResponse.json();
                if (subjectGroupsData.success) setSubjectGroups(subjectGroupsData.data);
            } catch (error) {
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token, router]);

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreatingAdmin(true);
        setCreateMessage('');
        setCreatedCredentials(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/admin/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(createForm),
            });

            const data = await response.json();

            if (!response.ok) {
                setCreateMessage(data.error || 'Yangi admin yaratilmadi');
                return;
            }

            setCreatedCredentials(data.data?.generated_credentials || null);
            setCreateMessage(data.message || 'Admin yaratildi');
            setCreateForm({ full_name: '', role: 'admin' });
            fetchUsers();
        } catch (error) {
            setCreateMessage('Yangi admin yaratishda xatolik yuz berdi');
        } finally {
            setCreatingAdmin(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/admin/users/list`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.success) setUsers(data.data);
        } catch (error) {
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm('Foydalanuvchini o\'chirmoqchimisiz?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/admin/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.ok) {
                fetchUsers();
            } else {
                const data = await response.json();
                alert(data.error || 'Xatolik yuz berdi');
            }
        } catch (error) {
            alert('Xatolik yuz berdi');
        }
    };

    const handleDeleteAllAdmins = async () => {
        if (!confirm('Barcha adminlarni o\'chirmoqchimisiz? Bu amalni qaytarib bo\'lmaydi!')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/admin/users/all`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message || 'Barcha adminlar o\'chirildi');
                fetchUsers();
            } else {
                alert(data.error || 'Xatolik yuz berdi');
            }
        } catch (error) {
            alert('Xatolik yuz berdi');
        }
    };

    const handleResetPassword = async (id: string, email: string) => {
        if (!confirm(`${email} uchun yangi parol generatsiya qilinsinmi?`)) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/admin/users/${id}/reset-password`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            const data = await response.json();

            if (response.ok) {
                alert(`Yangi parol: ${data.data.new_password}\n\nIltimos, nusxalab oling!`);
            } else {
                alert(data.error || 'Xatolik yuz berdi');
            }
        } catch (error) {
            alert('Xatolik yuz berdi');
        }
    };

    const handleCreateSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreatingSubject(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/admin/subjects`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(subjectForm),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || 'Fan yaratilmadi');
                return;
            }

            setSubjectForm({ name: '', description: '' });
            fetchData();
        } catch (error) {
            alert('Fan yaratishda xatolik yuz berdi');
        } finally {
            setCreatingSubject(false);
        }
    };

    const handleDeleteSubject = async (id: string) => {
        if (!confirm('Fanni o\'chirmoqchimisiz?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/admin/subjects/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.ok) {
                fetchData();
            }
        } catch (error) {
            alert('Xatolik yuz berdi');
        }
    };

    const handleLinkSubjectGroup = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/admin/subject-groups`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` },
                body: JSON.stringify(linkingForm),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || 'Bog\'lanish yaratilmadi');
                return;
            }

            setLinkingForm({ subject_id: '', group_id: '' });
            fetchData();
        } catch (error) {
            alert('Xatolik yuz berdi');
        }
    };

    const handleUnlinkSubjectGroup = async (id: string) => {
        if (!confirm('Bog\'lanishni o\'chirmoqchimisiz?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/admin/subject-groups/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.ok) {
                fetchData();
            }
        } catch (error) {
            alert('Xatolik yuz berdi');
        }
    };

    const handleCreateGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreatingGroup(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/admin/groups`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(groupForm),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || 'Guruh yaratilmadi');
                return;
            }

            setGroupForm({ name: '', description: '' });
            fetchData();
        } catch (error) {
            alert('Guruh yaratishda xatolik yuz berdi');
        } finally {
            setCreatingGroup(false);
        }
    };

    const handleDeleteGroup = async (id: string) => {
        if (!confirm('Guruhni o\'chirmoqchimisiz?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/admin/groups/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.ok) {
                fetchData();
            }
        } catch (error) {
            alert('Xatolik yuz berdi');
        }
    };

    const handleCreateLessonScript = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreatingScript(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/admin/lesson-scripts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` },
                body: JSON.stringify(scriptForm),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || 'Dars skripti yaratilmadi');
                return;
            }

            alert(data.message || 'Dars skripti muvaffaqiyatli saqlandi!');
            setScriptForm({ subject_id: '', content: '' });
            fetchData();
        } catch (error) {
            alert('Dars skripti yaratishda xatolik yuz berdi');
        } finally {
            setCreatingScript(false);
        }
    };

    const handleDeleteLessonScript = async (id: string) => {
        if (!confirm('Dars skriptini o\'chirmoqchimisiz?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/admin/lesson-scripts/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.ok) {
                fetchData();
            }
        } catch (error) {
            alert('Xatolik yuz berdi');
        }
    };

    const handleViewLessonScript = (script: any) => {
        alert(`Fan: ${script.subject_name || 'Umumiy'}\nGuruh: ${script.group_name || 'Umumiy'}\n\nKontent:\n${script.content}`);
    };

    const handleEditLessonScript = (script: any) => {
        setScriptForm({
            subject_id: script.subject_id || '',
            content: script.content
        });
    };

    const handleGenerateQuestions = async (id: string) => {
        if (!confirm('AI savollar generatsiya qilinsinmi?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/admin/lesson-scripts/${id}/generate-questions`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            const data = await response.json();

            if (response.ok) {
                alert(`${data.message}`);
                fetchData();
            } else {
                alert(data.error || 'Xatolik yuz berdi');
            }
        } catch (error) {
            alert('Xatolik yuz berdi');
        }
    };

    const fetchData = async () => {
        try {
            // Fetch users
            const usersResponse = await fetch(`${API_BASE_URL}/api/v1/admin/users/list`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const usersData = await usersResponse.json();
            if (usersData.success) setUsers(usersData.data);

            // Fetch subjects
            const subjectsResponse = await fetch(`${API_BASE_URL}/api/v1/admin/subjects`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const subjectsData = await subjectsResponse.json();
            if (subjectsData.success) setSubjects(subjectsData.data);

            // Fetch groups
            const groupsResponse = await fetch(`${API_BASE_URL}/api/v1/admin/groups`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const groupsData = await groupsResponse.json();
            if (groupsData.success) setGroups(groupsData.data);

            // Fetch lesson scripts
            const scriptsResponse = await fetch(`${API_BASE_URL}/api/v1/admin/lesson-scripts`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const scriptsData = await scriptsResponse.json();
            if (scriptsData.success) setLessonScripts(scriptsData.data);
        } catch (error) {
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-xl text-slate-400">Loading...</div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-200 mb-8">
                {user?.role === 'super_admin' ? 'Super Admin Panel' : 'Admin Panel'}
            </h1>

            {user?.role === 'super_admin' && (
                <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-6 rounded-2xl shadow-xl mb-8">
                    <h2 className="text-xl font-bold text-slate-200 mb-4">Yangi admin yaratish</h2>
                    <form onSubmit={handleCreateAdmin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">To'liq ism</label>
                            <input
                                type="text"
                                value={createForm.full_name}
                                onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-700 rounded-lg text-slate-200"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Rol</label>
                            <select
                                value={createForm.role}
                                onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as 'admin' })}
                                className="w-full px-4 py-2 border border-slate-700 rounded-lg text-slate-200"
                            >
                                <option value="admin">Administrator (Admin)</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={creatingAdmin}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 transition-colors"
                        >
                            {creatingAdmin ? 'Admin yaratilmoqda...' : 'Admin yaratish'}
                        </button>
                    </form>

                    {createMessage && (
                        <div className={`mt-4 px-4 py-3 rounded-lg border ${createMessage.includes('muvaffaqiyatli') || createMessage.includes('Admin yaratildi') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                            {createMessage}
                        </div>
                    )}

                    {createdCredentials && (
                        <div className="mt-4 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-4 rounded-lg">
                            <p className="font-bold mb-3 flex items-center gap-2">
                                <span>🔑</span> Avtomatik yaratilgan login va parol:
                            </p>
                            <div className="space-y-2 font-mono text-sm">
                                <div className="bg-slate-800/50 p-2 rounded border border-slate-700"><span className="font-bold text-slate-300">Login (Email):</span> {createdCredentials.email}</div>
                                <div className="bg-slate-800/50 p-2 rounded border border-slate-700"><span className="font-bold text-slate-300">Parol:</span> {createdCredentials.password}</div>
                            </div>
                            <p className="mt-3 text-xs text-blue-600 italic">* Ushbu ma'lumotlarni nusxalab oling, ular boshqa ko'rsatilmaydi.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Subjects (Fanlar) */}
            {user?.role === 'admin' && (
                <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-6 rounded-2xl shadow-xl mb-8">
                    <h2 className="text-xl font-bold text-slate-200 mb-4">Fanlar (Subjects)</h2>
                    <form onSubmit={handleCreateSubject} className="mb-6 flex gap-4">
                        <input
                            type="text"
                            placeholder="Fan nomi"
                            value={subjectForm.name}
                            onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                            className="flex-1 px-4 py-2 border border-slate-700 rounded-lg text-slate-200"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Tavsif (ixtiyoriy)"
                            value={subjectForm.description}
                            onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
                            className="flex-1 px-4 py-2 border border-slate-700 rounded-lg text-slate-200"
                        />
                        <button
                            type="submit"
                            disabled={creatingSubject}
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50"
                        >
                            {creatingSubject ? 'Qo\'shilmoqda...' : 'Qo\'shish'}
                        </button>
                    </form>
                    <div className="space-y-3">
                        {subjects.map((subject) => {
                            const linkedGroups = subjectGroups.filter(sg => sg.subject_id === subject.id);
                            return (
                                <div key={subject.id} className="p-4 bg-slate-800/50 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <span className="font-medium text-slate-200">{subject.name}</span>
                                            {subject.description && <span className="ml-2 text-slate-400 text-sm">- {subject.description}</span>}
                                        </div>
                                        <button
                                            onClick={() => handleDeleteSubject(subject.id)}
                                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                                        >
                                            O\'chirish
                                        </button>
                                    </div>
                                    {linkedGroups.length > 0 && (
                                        <div className="mt-2 pl-4 border-l-2 border-slate-700">
                                            <div className="text-sm text-slate-400 mb-1">Bog'langan guruhlar:</div>
                                            <div className="flex flex-wrap gap-2">
                                                {linkedGroups.map((sg) => (
                                                    <span key={sg.id} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                                        {sg.group_name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Subject-Group Linking (Fan-Guruh bog'lanishi) */}
            {user?.role === 'admin' && (
                <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-6 rounded-2xl shadow-xl mb-8">
                    <h2 className="text-xl font-bold text-slate-200 mb-4">Fan-Guruh Bog'lanishi</h2>
                    <form onSubmit={handleLinkSubjectGroup} className="mb-6 flex gap-4">
                        <select
                            value={linkingForm.subject_id}
                            onChange={(e) => setLinkingForm({ ...linkingForm, subject_id: e.target.value })}
                            className="flex-1 px-4 py-2 border border-slate-700 rounded-lg text-slate-200"
                            required
                        >
                            <option value="">Fan tanlang</option>
                            {subjects.map((subject) => (
                                <option key={subject.id} value={subject.id}>
                                    {subject.name}
                                </option>
                            ))}
                        </select>
                        <select
                            value={linkingForm.group_id}
                            onChange={(e) => setLinkingForm({ ...linkingForm, group_id: e.target.value })}
                            className="flex-1 px-4 py-2 border border-slate-700 rounded-lg text-slate-200"
                            required
                        >
                            <option value="">Guruh tanlang</option>
                            {groups.map((group) => (
                                <option key={group.id} value={group.id}>
                                    {group.name}
                                </option>
                            ))}
                        </select>
                        <button
                            type="submit"
                            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg"
                        >
                            Bog'lash
                        </button>
                    </form>
                    <div className="space-y-2">
                        {subjectGroups.map((sg) => (
                            <div key={sg.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                                <div>
                                    <span className="font-medium text-slate-200">{sg.subject_name}</span>
                                    <span className="mx-2 text-slate-400">→</span>
                                    <span className="font-medium text-slate-200">{sg.group_name}</span>
                                </div>
                                <button
                                    onClick={() => handleUnlinkSubjectGroup(sg.id)}
                                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                                >
                                    Bog'lanishni o'chirish
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Groups (Guruhlar) */}
            {user?.role === 'admin' && (
                <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-6 rounded-2xl shadow-xl mb-8">
                    <h2 className="text-xl font-bold text-slate-200 mb-4">Guruhlar (Study Groups)</h2>
                    <form onSubmit={handleCreateGroup} className="mb-6 flex gap-4">
                        <input
                            type="text"
                            placeholder="Guruh nomi"
                            value={groupForm.name}
                            onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                            className="flex-1 px-4 py-2 border border-slate-700 rounded-lg text-slate-200"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Tavsif (ixtiyoriy)"
                            value={groupForm.description}
                            onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                            className="flex-1 px-4 py-2 border border-slate-700 rounded-lg text-slate-200"
                        />
                        <button
                            type="submit"
                            disabled={creatingGroup}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50"
                        >
                            {creatingGroup ? 'Qo\'shilmoqda...' : 'Qo\'shish'}
                        </button>
                    </form>
                    <div className="space-y-2">
                        {groups.map((group) => (
                            <div key={group.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                                <div>
                                    <span className="font-medium text-slate-200">{group.name}</span>
                                    {group.description && <span className="ml-2 text-slate-400 text-sm">- {group.description}</span>}
                                </div>
                                <button
                                    onClick={() => handleDeleteGroup(group.id)}
                                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                                >
                                    O\'chirish
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Lesson Scripts (Dars skriptlari) */}
            {user?.role === 'admin' && (
                <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-6 rounded-2xl shadow-xl mb-8">
                    <h2 className="text-xl font-bold text-slate-200 mb-4">Dars Skriptlari (AI savollar yaratish)</h2>
                    <form onSubmit={handleCreateLessonScript} className="mb-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Fan</label>
                            <select
                                value={scriptForm.subject_id}
                                onChange={(e) => setScriptForm({ ...scriptForm, subject_id: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-700 rounded-lg text-slate-200"
                                required
                            >
                                <option value="">Fan tanlang</option>
                                {subjects.map((subject) => (
                                    <option key={subject.id} value={subject.id}>
                                        {subject.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Dars kontenti (mavzular, tushuntirishlar)</label>
                            <textarea
                                placeholder="Dars mavzulari va tushuntirishlarni kiriting..."
                                value={scriptForm.content}
                                onChange={(e) => setScriptForm({ ...scriptForm, content: e.target.value })}
                                className="w-full min-h-40 px-4 py-2 border border-slate-700 rounded-lg text-slate-200"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={creatingScript}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50"
                        >
                            {creatingScript ? 'Yaratilmoqda...' : 'Dars skriptini saqlash'}
                        </button>
                    </form>
                    <div className="space-y-2">
                        {lessonScripts.map((script) => (
                            <div key={script.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                                <div>
                                    <div className="font-medium text-slate-200">
                                        {script.subject_name ? `${script.subject_name} uchun dars scripti` : 'Umumiy dars scripti'}
                                    </div>
                                    {script.group_name && (
                                        <div className="text-sm text-slate-400">
                                            Guruh: {script.group_name}
                                        </div>
                                    )}
                                    <div className="text-xs text-gray-400 mt-1">
                                        {new Date(script.created_at).toLocaleDateString('uz-UZ')}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleViewLessonScript(script)}
                                        className="bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium py-1 px-3 rounded"
                                    >
                                        Ko'rish
                                    </button>
                                    <button
                                        onClick={() => handleEditLessonScript(script)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1 px-3 rounded"
                                    >
                                        Tahrirlash
                                    </button>
                                    <button
                                        onClick={() => handleDeleteLessonScript(script.id)}
                                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                                    >
                                        O'chirish
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Student Progress (O'quvchilarning dars darajasi) */}
            {user?.role === 'admin' && (
                <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-6 rounded-2xl shadow-xl mb-8">
                    <h2 className="text-xl font-bold text-slate-200 mb-4">O'quvchilarning Dars Darajasi</h2>
                    <div className="space-y-2">
                        {studentProgress.length === 0 ? (
                            <div className="text-slate-400 text-center py-4">Hali o'quvchilar dars o'tmagan</div>
                        ) : (
                            studentProgress.map((progress) => (
                                <div key={progress.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                                    <div>
                                        <div className="font-medium text-slate-200">{progress.student_name}</div>
                                        <div className="text-sm text-slate-400">
                                            Fan: {progress.subject}
                                        </div>
                                        <div className="text-sm text-slate-400">
                                            Guruh: {progress.study_group}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">
                                            Oxirgi kirish: {new Date(progress.last_accessed_at).toLocaleDateString('uz-UZ')}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-slate-200">
                                            Dars: {progress.lesson_number}
                                        </div>
                                        {progress.lesson_script_title && (
                                            <div className="text-xs text-slate-400">
                                                {progress.lesson_script_title}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Users (Adminlar) */}
            {user?.role === 'super_admin' && (
                <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-6 rounded-2xl shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-slate-200">Adminlar ro'yxati</h2>
                        {users.length > 0 && (
                            <button
                                onClick={handleDeleteAllAdmins}
                                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg text-sm"
                            >
                                Barcha adminlarni o'chirish
                            </button>
                        )}
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-800/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">Ism</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">Email</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">Rol</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-300">Amallar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.id} className="border-t hover:bg-slate-800/50">
                                        <td className="px-6 py-3 text-sm text-slate-200">{u.full_name}</td>
                                        <td className="px-6 py-3 text-sm text-slate-200">{u.email}</td>
                                        <td className="px-6 py-3 text-sm">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                u.role === 'super_admin' ? 'bg-red-100 text-red-700' :
                                                u.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                                                'bg-green-100 text-green-700'
                                            }`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-sm space-x-2">
                                            {u.role !== 'super_admin' && (
                                                <>
                                                    <button
                                                        onClick={() => handleResetPassword(u.id, u.email)}
                                                        className="text-blue-600 hover:text-blue-700 font-medium"
                                                    >
                                                        Parolni o'zgartirish
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(u.id)}
                                                        className="text-red-600 hover:text-red-700 font-medium"
                                                    >
                                                        O'chirish
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
