import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import userApi from "../../api/userApi";
import teamApi from "../../api/teamApi";
import positionApi from "../../api/positionApi";
import type { User } from "../../api/userApi";

type AdminTab = "dashboard" | "user" | "team" | "config";
type ModalType = "team" | null;
type UserModalType = "add" | "edit" | null;

interface UserFormState {
  username: string;
  email: string;
  role: string;
  team: string;
  status: string;
}

interface AdminContextType {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  modal: ModalType;
  setModal: (modal: ModalType) => void;
  userModal: UserModalType;
  setUserModal: (modal: UserModalType) => void;
  users: User[];
  setUsers: (users: User[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  userForm: UserFormState;
  setUserForm: (form: UserFormState) => void;
  currentUserId: string | null;
  setCurrentUserId: (id: string | null) => void;
  currentUser: any;
  setCurrentUser: (user: any) => void;
  showUserMenu: boolean;
  setShowUserMenu: (show: boolean) => void;
  menuTimeout: number | null;
  setMenuTimeout: (timeout: number | null) => void;
  teamForm: {
    name: string;
    department: string;
    description: string;
    logo: string;
    leaderId: string;
    contact: {
      phone: string;
    };
  };
  setTeamForm: (form: any) => void;
  teams: any[];
  setTeams: (teams: any[]) => void;
  teamAdmins: any[];
  setTeamAdmins: (admins: any[]) => void;
  currentTeamId: string | null;
  setCurrentTeamId: (id: string | null) => void;
  positions: any[];
  setPositions: (positions: any[]) => void;
  fetchUsers: () => Promise<void>;
  fetchTeams: () => Promise<void>;
  fetchTeamAdmins: () => Promise<void>;
  fetchPositions: () => Promise<void>;
  handleAddUser: () => Promise<void>;
  handleEditUser: () => Promise<void>;
  handleDeleteUser: (userId: string) => Promise<void>;
  openEditTeamModal: (team: any) => void;
  handleCreateTeam: () => Promise<void>;
  handleDeleteTeam: (teamId: string) => Promise<void>;
  openEditModal: (user: User) => Promise<void>;
  openAddModal: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const initialUserForm: UserFormState = {
  username: "",
  email: "",
  role: "student",
  team: "",
  status: "active",
};

export function AdminProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<AdminTab>(() => {
    const savedTab = localStorage.getItem("teamActiveTab");
    return (savedTab as AdminTab) || "dashboard";
  });

  useEffect(() => {
    localStorage.setItem("teamActiveTab", activeTab);
  }, [activeTab]);

  const [modal, setModal] = useState<ModalType>(null);
  const [userModal, setUserModal] = useState<UserModalType>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userForm, setUserForm] = useState<UserFormState>(initialUserForm);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [menuTimeout, setMenuTimeout] = useState<number | null>(null);

  const [teamForm, setTeamForm] = useState({
    name: "",
    department: "",
    description: "",
    logo: "",
    leaderId: "",
    contact: {
      phone: "",
    },
  });

  const [teams, setTeams] = useState<any[]>([]);
  const [teamAdmins, setTeamAdmins] = useState<any[]>([]);
  const [currentTeamId, setCurrentTeamId] = useState<string | null>(null);
  const [positions, setPositions] = useState<any[]>([]);

  useEffect(() => {
    const user = userApi.getCurrentUser();
    setCurrentUser(user);
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userList = await userApi.getUsers();
      setUsers(userList);
    } catch (err: any) {
      setError(err.message || "获取用户列表失败");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeams = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const teamList = await teamApi.getTeams();
      const userList = await userApi.getUsers();
      const teamsWithLeaderAndMembers = teamList.map((team: any) => {
        const leader = userList.find((user: any) => user._id === team.leaderId);
        const members = userList.filter((user: any) => {
          if (!user.team) return false;
          if (typeof user.team === "object" && user.team._id) {
            return user.team._id === team._id;
          } else {
            return user.team === team._id;
          }
        });
        return {
          ...team,
          leader: leader ? leader.username : "无",
          members: members,
        };
      });
      setTeams(teamsWithLeaderAndMembers);
    } catch (err: any) {
      setError(err.message || "获取团队列表失败");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeamAdmins = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userList = await userApi.getUsers();
      const admins = userList.filter((user: any) => user.role === "hr");
      setTeamAdmins(admins);
    } catch (err: any) {
      setError(err.message || "获取团队管理员列表失败");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPositions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const positionList = await positionApi.getPositions();
      setPositions(positionList);
    } catch (err: any) {
      setError(err.message || "获取职位列表失败");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "dashboard" || activeTab === "user") {
      fetchUsers();
      fetchTeams();
      fetchPositions();
    } else if (activeTab === "team") {
      fetchTeams();
      fetchTeamAdmins();
    }
  }, [activeTab]);

  const handleAddUser = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await userApi.register({
        username: userForm.username,
        password: "123456",
        email: userForm.email,
        role: userForm.role,
      });
      setUserModal(null);
      setUserForm(initialUserForm);
      fetchUsers();
      fetchTeams();
    } catch (err: any) {
      setError(err.message || "添加用户失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = async () => {
    if (!currentUserId) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await userApi.updateUser(currentUserId, {
        username: userForm.username,
        email: userForm.email,
        role: userForm.role,
        team: userForm.team,
        status: userForm.status,
      });
      if (result.success) {
        setUserModal(null);
        setUserForm(initialUserForm);
        setCurrentUserId(null);
        fetchUsers();
        fetchTeams();
      }
    } catch (err: any) {
      setError(err.message || "更新用户失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("确定要删除这个用户吗？")) return;
    setIsLoading(true);
    setError(null);
    try {
      await userApi.deleteUser(userId);
      fetchUsers();
      fetchTeams();
    } catch (err: any) {
      setError(err.message || "删除用户失败");
    } finally {
      setIsLoading(false);
    }
  };

  const openEditTeamModal = (team: any) => {
    setCurrentTeamId(team._id);
    setTeamForm({
      name: team.name,
      department: team.department,
      description: team.description,
      logo: team.logo,
      leaderId: team.leaderId,
      contact: {
        phone: team.contact.phone || "",
      },
    });
    setModal("team");
  };

  const handleCreateTeam = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (currentTeamId) {
        await teamApi.updateTeam(currentTeamId, {
          name: teamForm.name,
          department: teamForm.department,
          description: teamForm.description,
          leaderId: teamForm.leaderId,
          logo: teamForm.logo,
          contact: teamForm.contact,
        });
      } else {
        await teamApi.createTeam({
          name: teamForm.name,
          department: teamForm.department,
          description: teamForm.description,
          leaderId: teamForm.leaderId,
          logo: teamForm.logo,
          contact: teamForm.contact,
        });
      }
      setModal(null);
      setCurrentTeamId(null);
      setTeamForm({
        name: "",
        department: "",
        description: "",
        logo: "",
        leaderId: "",
        contact: {
          phone: "",
        },
      });
      fetchTeams();
    } catch (err: any) {
      setError(err.message || (currentTeamId ? "更新团队失败" : "创建团队失败"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (window.confirm("确定要删除这个团队吗？")) {
      setIsLoading(true);
      setError(null);
      try {
        await teamApi.deleteTeam(teamId);
        fetchTeams();
      } catch (err: any) {
        setError(err.message || "删除团队失败");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const openEditModal = async (user: User) => {
    setCurrentUserId(user._id);
    let teamValue = "";
    if (user.team) {
      teamValue =
        typeof user.team === "object" && user.team._id
          ? user.team._id
          : user.team;
    }
    setUserForm({
      username: user.username,
      email: user.email,
      role: user.role,
      team: teamValue,
      status: user.status,
    });
    setUserModal("edit");
  };

  const openAddModal = () => {
    setUserForm(initialUserForm);
    setCurrentUserId(null);
    setUserModal("add");
  };

  const value: AdminContextType = {
    activeTab,
    setActiveTab,
    modal,
    setModal,
    userModal,
    setUserModal,
    users,
    setUsers,
    isLoading,
    setIsLoading,
    error,
    setError,
    userForm,
    setUserForm,
    currentUserId,
    setCurrentUserId,
    currentUser,
    setCurrentUser,
    showUserMenu,
    setShowUserMenu,
    menuTimeout,
    setMenuTimeout,
    teamForm,
    setTeamForm,
    teams,
    setTeams,
    teamAdmins,
    setTeamAdmins,
    currentTeamId,
    setCurrentTeamId,
    positions,
    setPositions,
    fetchUsers,
    fetchTeams,
    fetchTeamAdmins,
    fetchPositions,
    handleAddUser,
    handleEditUser,
    handleDeleteUser,
    openEditTeamModal,
    handleCreateTeam,
    handleDeleteTeam,
    openEditModal,
    openAddModal,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}

export type { AdminTab, ModalType, UserModalType, UserFormState };