import ProfileModal from '../modals/ProfileModal';
import Logo from '../common/Logo';
import { useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import productApi from '../../api/productApi';
import * as taskApi from '../../api/taskApi';
import { useSocket } from '../../context/SocketContext';
import useSidebarStore from '../../store/useSidebarStore';
import {
  ShoppingBag, Laptop, Smartphone, Shirt, BookOpen,
  Home as HomeIcon, Trophy, Gamepad2, Package, Menu, X,
  LogOut, Users, ChevronRight, ChevronLeft, Trash2,
  ChevronDown, User, UserPlus, Baby, ShieldCheck, Layers,
  Watch, Glasses, Car, Utensils, HeartPulse, Music, Camera,
  Briefcase, Coffee, Sofa, Dumbbell, Palette, Cpu, PieChart, ClipboardList
} from 'lucide-react';

const Sidebar = ({ selectedCategory, selectedSubcategory, onFilterChange, refreshTrigger }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const { user, logout, hasPermission } = useContext(AuthContext);
  const { isOpen, toggleSidebar } = useSidebarStore();
  const socket = useSocket();
  const navigate = useNavigate();
  const location = useLocation();

  const isSuperAdmin = user?.role === 'super_admin';

  const fetchCategories = useCallback(async () => {
    if (isSuperAdmin) return;
    try {
      setLoading(true);
      const data = await productApi.getAllCategoriesWithSubcategories();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin]);

  const fetchPendingCount = useCallback(async () => {
    if (!user) return;
    try {
      const response = await taskApi.getUnreadCount();
      setPendingCount(response.pendingCount || 0);
    } catch (err) {
      console.error('Error fetching task count:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchCategories();
    fetchPendingCount();
  }, [refreshTrigger, isSuperAdmin, fetchCategories, fetchPendingCount]);

  useEffect(() => {
    if (!socket || !user) return;

    const handleTaskChange = () => {
      fetchPendingCount();
    };

    socket.on('taskCreated', handleTaskChange);
    socket.on('taskUpdated', handleTaskChange);
    socket.on('taskDeleted', handleTaskChange);
    socket.on('taskRead', handleTaskChange);

    return () => {
      socket.off('taskCreated', handleTaskChange);
      socket.off('taskUpdated', handleTaskChange);
      socket.off('taskDeleted', handleTaskChange);
      socket.off('taskRead', handleTaskChange);
    };
  }, [socket, user, fetchPendingCount]);

  const navigateAndFilter = (filterObj) => {
    if (location.pathname !== '/') {
      navigate('/');
    }
    if (onFilterChange) onFilterChange(filterObj);
  };

  const handleCategoryClick = (e, categoryId, categoryName) => {
    e.stopPropagation();
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryId);
    }
    navigateAndFilter({ category: categoryId, categoryName, subcategory: '', subcategoryName: '' });
    setIsMobileMenuOpen(false);
  };

  const handleSubcategoryClick = (e, categoryId, categoryName, subcategoryId, subcategoryName) => {
    e.stopPropagation();
    navigateAndFilter({ category: categoryId, categoryName, subcategory: subcategoryId, subcategoryName });
    setIsMobileMenuOpen(false);
  };

  const handleAllProducts = () => {
    navigateAndFilter({ category: '', subcategory: '' });
    setExpandedCategory(null);
    setIsMobileMenuOpen(false);
  };

  const handleTrash = () => {
    navigateAndFilter({ category: 'trash', subcategory: '' });
    setExpandedCategory(null);
    setIsMobileMenuOpen(false);
  };

  const getIconForCategory = (name) => {
    const lowerName = name.toLowerCase();


    if (lowerName === 'men' || lowerName.includes('menswear')) return User;
    if (lowerName === 'women' || lowerName.includes('womenswear')) return UserPlus;
    if (lowerName.includes('kid') || lowerName.includes('bab')) return Baby;
    if (lowerName.includes('fash') || lowerName.includes('cloth') || lowerName.includes('apparel') || lowerName.includes('wear')) return Shirt;


    if (lowerName.includes('watch') || lowerName.includes('clock') || lowerName.includes('time')) return Watch;
    if (lowerName.includes('glass') || lowerName.includes('eyewear') || lowerName.includes('sunglass')) return Glasses;
    if (lowerName.includes('bag') || lowerName.includes('purse') || lowerName.includes('wallet') || lowerName.includes('luggage')) return Briefcase;
    if (lowerName.includes('shoe') || lowerName.includes('foot') || lowerName.includes('sneaker') || lowerName.includes('boot')) return User;


    if (lowerName.includes('elect') || lowerName.includes('comput') || lowerName.includes('laptop') || lowerName.includes('pc')) return Laptop;
    if (lowerName.includes('phone') || lowerName.includes('mobile') || lowerName.includes('cell')) return Smartphone;
    if (lowerName.includes('audio') || lowerName.includes('music') || lowerName.includes('sound') || lowerName.includes('speaker') || lowerName.includes('headphone')) return Music;
    if (lowerName.includes('camera') || lowerName.includes('photo') || lowerName.includes('video')) return Camera;
    if (lowerName.includes('tech') || lowerName.includes('gadget') || lowerName.includes('component')) return Cpu;


    if (lowerName.includes('home') || lowerName.includes('house')) return HomeIcon;
    if (lowerName.includes('furnitur') || lowerName.includes('decor') || lowerName.includes('sofa') || lowerName.includes('bed')) return Sofa;
    if (lowerName.includes('kitchen') || lowerName.includes('cook') || lowerName.includes('food')) return Utensils;
    if (lowerName.includes('coffee') || lowerName.includes('tea') || lowerName.includes('drink')) return Coffee;


    if (lowerName.includes('book') || lowerName.includes('read') || lowerName.includes('novel')) return BookOpen;
    if (lowerName.includes('sport') || lowerName.includes('athlet') || lowerName.includes('outdoor')) return Trophy;
    if (lowerName.includes('toy') || lowerName.includes('game') || lowerName.includes('play')) return Gamepad2;
    if (lowerName.includes('art') || lowerName.includes('craft') || lowerName.includes('paint') || lowerName.includes('draw')) return Palette;


    if (lowerName.includes('health') || lowerName.includes('medic') || lowerName.includes('pharm') || lowerName.includes('care')) return HeartPulse;
    if (lowerName.includes('fit') || lowerName.includes('gym') || lowerName.includes('workout') || lowerName.includes('exercis')) return Dumbbell;
    if (lowerName.includes('beauty') || lowerName.includes('cosmetic') || lowerName.includes('makeup')) return User;


    if (lowerName.includes('car') || lowerName.includes('auto') || lowerName.includes('motor') || lowerName.includes('vehic')) return Car;


    return Package;
  };

  const hasProfileImage = user?.profileImage && user.profileImage !== "no-photo.jpg";
  const profileImageUrl = hasProfileImage
    ? (user.profileImage.startsWith('http') ? user.profileImage : `http://localhost:3006/${user.profileImage}`)
    : null;
  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';


  const theme = {
    bg: isSuperAdmin ? 'bg-[#0f112a]' : 'bg-slate-900',
    border: isSuperAdmin ? 'border-white/5' : 'border-slate-800',
    itemHover: isSuperAdmin ? 'hover:bg-white/5' : 'hover:bg-slate-800',
    itemActive: isSuperAdmin ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-white text-slate-900 shadow-lg',
    iconActive: isSuperAdmin ? 'text-white' : 'text-indigo-500',
    profileHover: isSuperAdmin ? 'hover:bg-white/5' : 'hover:bg-slate-800',
    logoutBg: isSuperAdmin ? 'bg-white/5' : 'bg-slate-800',
    logoutHover: 'hover:bg-red-500/40 hover:text-white'
  };

  return (
    <>
      { }
      <div className={`lg:hidden fixed top-0 left-0 right-0 ${theme.bg} border-b ${theme.border} z-40 shadow-lg`}>
        <div className="flex items-center justify-between px-5 py-4">
          <Logo />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all`}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-white" />
            ) : (
              <Menu className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      </div>

      { }
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      { }
      <aside
        className={`fixed top-0 left-0 h-screen ${theme.bg} z-50 transition-all duration-300 ease-in-out border-r ${theme.border} flex flex-col ${isOpen ? 'w-72' : 'w-20'
          } ${isMobileMenuOpen ? 'translate-x-0 !w-72' : 'max-lg:-translate-x-full'}`}
      >
        { }
        <div className={`px-6 pt-10 pb-6 border-b ${theme.border} flex ${isOpen ? 'items-center justify-between' : 'flex-col items-center gap-8 px-0'}`}>
          <Link to={isSuperAdmin ? "/admin/dashboard" : "/"}>
            <Logo hideText={!isOpen && !isMobileMenuOpen} />
          </Link>

          <button
            onClick={toggleSidebar}
            className="hidden lg:flex items-center justify-center text-slate-500 hover:text-white transition-all transform hover:scale-110"
          >
            {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        { }
        <nav className="flex-1 px-4 overflow-y-auto py-6 space-y-6 scrollbar-hide">
          { }
          <div className="space-y-1">
            {(isOpen || isMobileMenuOpen) && (
              <p className={`text-[10px] font-bold ${isSuperAdmin ? 'text-white/20' : 'text-slate-500'} uppercase tracking-widest px-3 mb-3`}>Main</p>
            )}

            {isSuperAdmin ? (
              <>
                <button
                  onClick={() => navigate('/admin/dashboard')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${location.pathname === '/admin/dashboard'
                    ? theme.itemActive
                    : `text-slate-400 ${theme.itemHover} hover:text-white`
                    } ${!isOpen && !isMobileMenuOpen ? 'justify-center px-0' : ''}`}
                  title={!isOpen ? 'Platform Overview' : ''}
                >
                  <HomeIcon className="w-4 h-4 flex-shrink-0" />
                  {(isOpen || isMobileMenuOpen) && <span>Platform Overview</span>}
                </button>
                <button
                  onClick={() => navigate('/admin/shops')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${location.pathname === '/admin/shops'
                    ? theme.itemActive
                    : `text-slate-400 ${theme.itemHover} hover:text-white`
                    } ${!isOpen && !isMobileMenuOpen ? 'justify-center px-0' : ''}`}
                  title={!isOpen ? 'Manage Shops' : ''}
                >
                  <Users className="w-4 h-4 flex-shrink-0" />
                  {(isOpen || isMobileMenuOpen) && <span>Manage Shops</span>}
                </button>
                <button
                  onClick={() => navigate('/admin/analytics')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${location.pathname === '/admin/analytics'
                    ? theme.itemActive
                    : `text-slate-400 ${theme.itemHover} hover:text-white`
                    } ${!isOpen && !isMobileMenuOpen ? 'justify-center px-0' : ''}`}
                  title={!isOpen ? 'Analytics' : ''}
                >
                  <PieChart className="w-4 h-4 flex-shrink-0" />
                  {(isOpen || isMobileMenuOpen) && <span>Analytics</span>}
                </button>
                <button
                  onClick={() => navigate('/tasks')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${location.pathname === '/tasks'
                    ? theme.itemActive
                    : `text-slate-400 ${theme.itemHover} hover:text-white`
                    } ${!isOpen && !isMobileMenuOpen ? 'justify-center px-0' : ''}`}
                  title={!isOpen ? 'Task Overview' : ''}
                >
                  <ClipboardList className="w-4 h-4 flex-shrink-0" />
                  {(isOpen || isMobileMenuOpen) && <span>Task Overview</span>}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleAllProducts}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${location.pathname === '/' && !selectedCategory
                    ? theme.itemActive
                    : `text-slate-400 ${theme.itemHover} hover:text-white`
                    } ${!isOpen && !isMobileMenuOpen ? 'justify-center px-0' : ''}`}
                  title={!isOpen ? 'Dashboard' : ''}
                >
                  <Package className="w-4 h-4 flex-shrink-0" />
                  {(isOpen || isMobileMenuOpen) && <span>Dashboard</span>}
                </button>

                {hasPermission('delete_product') && (
                  <button
                    onClick={handleTrash}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${selectedCategory === 'trash'
                      ? 'bg-red-600 text-white shadow-lg shadow-red-900/20'
                      : `text-slate-400 ${theme.itemHover} hover:text-red-400`
                      } ${!isOpen && !isMobileMenuOpen ? 'justify-center px-0' : ''}`}
                    title={!isOpen ? 'Trash' : ''}
                  >
                    <Trash2 className="w-4 h-4 flex-shrink-0" />
                    {(isOpen || isMobileMenuOpen) && <span>Trash</span>}
                  </button>
                )}

                {(user?.role === 'owner' || user?.role === 'manager') && (
                  <>
                    <button
                      onClick={() => navigate('/analytics')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${location.pathname === '/analytics'
                        ? theme.itemActive
                        : `text-slate-400 ${theme.itemHover} hover:text-white`
                        } ${!isOpen && !isMobileMenuOpen ? 'justify-center px-0' : ''}`}
                      title={!isOpen ? 'Analytics' : ''}
                    >
                      <PieChart className="w-4 h-4 flex-shrink-0" />
                      {(isOpen || isMobileMenuOpen) && <span>Analytics</span>}
                    </button>
                  </>
                )}

                <button
                  onClick={() => navigate('/tasks')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${location.pathname === '/tasks'
                    ? theme.itemActive
                    : `text-slate-400 ${theme.itemHover} hover:text-white`
                    } ${!isOpen && !isMobileMenuOpen ? 'justify-center px-0' : ''}`}
                  title={!isOpen ? (user?.role === 'employee' ? 'My Tasks' : 'Tasks') : ''}
                >
                  <div className="flex items-center gap-3">
                    <ClipboardList className="w-4 h-4 flex-shrink-0" />
                    {(isOpen || isMobileMenuOpen) && (
                      <span>{user?.role === 'employee' ? 'My Tasks' : 'Tasks'}</span>
                    )}
                  </div>
                  {(isOpen || isMobileMenuOpen) && pendingCount > 0 && (
                    <span className="flex items-center justify-center min-w-[18px] h-[18px] bg-indigo-500 text-white text-[10px] font-bold rounded-full px-1 animate-in zoom-in-50 duration-300 shadow-sm">
                      {pendingCount > 99 ? '99+' : pendingCount}
                    </span>
                  )}
                  {!isOpen && !isMobileMenuOpen && pendingCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500 shadow-sm animate-pulse" />
                  )}
                </button>
              </>
            )}
          </div>

          {!isSuperAdmin && (
            <>
              { }
              <div>
                <div className={`flex items-center justify-between px-3 mb-3 ${!isOpen && !isMobileMenuOpen ? 'justify-center px-0' : ''}`}>
                  {(isOpen || isMobileMenuOpen) && (
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Categories</p>
                  )}
                  {loading && <div className="w-3 h-3 border-2 border-slate-500 border-t-white rounded-full animate-spin" />}
                </div>

                <ul className="space-y-1">
                  {categories.map((cat) => {
                    const Icon = getIconForCategory(cat.name);
                    const isExpanded = expandedCategory === cat._id;
                    const isActive = selectedCategory === cat._id;

                    return (
                      <li key={cat._id}>
                        <button
                          onClick={(e) => handleCategoryClick(e, cat._id, cat.name)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive && !selectedSubcategory
                            ? theme.itemActive
                            : `text-slate-400 ${theme.itemHover} hover:text-white`
                            } ${!isOpen && !isMobileMenuOpen ? 'justify-center px-0' : ''}`}
                          title={!isOpen ? cat.name : ''}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? theme.iconActive : ''}`} />
                            {(isOpen || isMobileMenuOpen) && <span>{cat.name}</span>}
                          </div>
                          {(isOpen || isMobileMenuOpen) && cat.subcategories?.length > 0 && (
                            <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                              <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                            </div>
                          )}
                        </button>

                        {(isOpen || isMobileMenuOpen) && isExpanded && cat.subcategories?.length > 0 && (
                          <ul className={`mt-1 ml-6 space-y-0.5 border-l ${theme.border} pl-3 py-1`}>
                            {cat.subcategories.map((sub) => {
                              const isSubActive = selectedSubcategory === sub._id;
                              return (
                                <li key={sub._id}>
                                  <button
                                    onClick={(e) => handleSubcategoryClick(e, cat._id, cat.name, sub._id, sub.name)}
                                    className={`w-full text-left py-1.5 px-3 rounded-lg text-xs transition-all ${isSubActive
                                      ? 'text-white bg-indigo-600 font-bold'
                                      : `text-slate-400 hover:text-white ${theme.itemHover}/50 font-medium`
                                      }`}
                                  >
                                    {sub.name}
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>

              { }
              {(user?.role === 'owner' || user?.role === 'manager') && (
                <div>
                  {(isOpen || isMobileMenuOpen) && (
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-3">Operations</p>
                  )}
                  <ul className="space-y-1">
                    <li>
                      <button
                        onClick={() => navigate('/employees')}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-400 ${theme.itemHover} hover:text-white transition-all ${!isOpen && !isMobileMenuOpen ? 'justify-center px-0' : ''}`}
                        title={!isOpen ? 'Manage Employees' : ''}
                      >
                        <Users className="w-4 h-4 flex-shrink-0" />
                        {(isOpen || isMobileMenuOpen) && <span>Manage Employees</span>}
                      </button>
                    </li>
                    {user?.role === 'owner' && (
                      <li>
                        <button
                          onClick={() => navigate('/managers')}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-400 ${theme.itemHover} hover:text-white transition-all ${!isOpen && !isMobileMenuOpen ? 'justify-center px-0' : ''}`}
                          title={!isOpen ? 'Manage Managers' : ''}
                        >
                          <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                          {(isOpen || isMobileMenuOpen) && <span>Manage Managers</span>}
                        </button>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </>
          )}
        </nav>

        { }
        <div className={`p-4 border-t ${theme.border} ${!isOpen && !isMobileMenuOpen ? 'px-2' : ''}`}>
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl ${theme.profileHover} transition-all group text-left mb-3 ${!isOpen && !isMobileMenuOpen ? 'justify-center p-2' : ''}`}
            title={!isOpen ? user?.name : ''}
          >
            <div className="relative flex-shrink-0">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt="Profile"
                  className={`w-10 h-10 rounded-full object-cover border-2 ${isSuperAdmin ? 'border-indigo-500/30' : 'border-slate-700'} shadow-sm group-hover:border-indigo-500/50 transition-all`}
                />
              ) : (
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${isSuperAdmin ? 'border-indigo-500/30 bg-indigo-600' : 'border-slate-700 bg-slate-600'} shadow-sm group-hover:border-indigo-500/50 transition-all`}>
                  <span className="text-white text-xs font-bold tracking-wide">{userInitials}</span>
                </div>
              )}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#0f112a] rounded-full shadow-sm" />
            </div>
            {(isOpen || isMobileMenuOpen) && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate leading-tight mb-1">{user?.name || 'Guest'}</p>
                <div className="flex items-center gap-2">
                  <p className={`text-[10px] font-bold ${isSuperAdmin ? 'text-white/40' : 'text-slate-500'} uppercase tracking-widest whitespace-nowrap leading-tight`}>
                    {user?.role === 'owner' ? 'Store Owner' : (isSuperAdmin ? 'Platform Admin' : user?.role || 'User')}
                  </p>
                  {!isSuperAdmin && user?.shopName && (
                    <>
                      <div className="w-1 h-1 rounded-full bg-slate-700 flex-shrink-0" />
                      <p className="text-[10px] font-bold text-white uppercase tracking-widest truncate opacity-80">
                        {user.shopName}
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}
          </button>

          <button
            onClick={logout}
            className={`flex items-center justify-center gap-2 py-3.5 rounded-xl ${theme.logoutBg} ${isSuperAdmin ? 'text-white/70' : 'text-slate-400'} text-xs font-bold ${theme.logoutHover} transition-all ${isOpen || isMobileMenuOpen ? 'w-full px-4' : 'w-10 mx-auto px-0'
              }`}
            title={!isOpen ? 'Sign Out' : ''}
          >
            <LogOut className="w-3.5 h-3.5" />
            {(isOpen || isMobileMenuOpen) && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
};

export default Sidebar;
