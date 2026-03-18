import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, AlertCircle, CheckCircle, Clock, ChevronLeft, ChevronRight, ChevronDown, Check } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import employeeApi from '../../api/employeeApi';
import { toast } from 'react-toastify';

const TaskModal = ({ isOpen, onClose, onSave, task, user, preSelectedAssignee }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    status: 'Pending',
    assignedTo: preSelectedAssignee?._id || '',
    dueDate: null,
  });
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [priorityDropdownOpen, setPriorityDropdownOpen] = useState(false);
  const priorityRef = useRef(null);

  const isEdit = !!task;
  const isEmployee = user?.role === 'employee';
  const isPlatformAdmin = user?.role === 'super_admin';
  const canEditEverything = (user?.role === 'manager' || user?.role === 'owner') && !isPlatformAdmin;
  const isReadOnly = isEmployee || isPlatformAdmin;

  useEffect(() => {
    if (isOpen && canEditEverything) {
      const fetchEmployees = async () => {
        try {
          setLoadingEmployees(true);
          const response = await employeeApi.getEmployees({ isActive: true });
          let fetchedEmployees = response.data || [];

          
          if (user?.role === 'manager') {
            fetchedEmployees = fetchedEmployees.filter(emp => emp.role === 'employee');
          }
          

          setEmployees(fetchedEmployees);
        } catch (error) {
          console.error('Error fetching employees:', error);
          toast.error('Failed to load employee list');
        } finally {
          setLoadingEmployees(false);
        }
      };
      fetchEmployees();
    }
  }, [isOpen, canEditEverything]);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'Medium',
        status: task.status || 'Pending',
        assignedTo: task.assignedTo?._id || task.assignedTo || '',
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'Medium',
        status: 'Pending',
        assignedTo: preSelectedAssignee?._id || '',
        dueDate: null,
      });
    }
  }, [task, isOpen, preSelectedAssignee]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (priorityRef.current && !priorityRef.current.contains(event.target)) {
        setPriorityDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Save task error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 animate-in zoom-in-95 duration-300 flex flex-col max-h-[92vh]">
        {}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0 rounded-t-3xl">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {isEdit ? 'Edit Task' : 'Create New Task'}
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5 uppercase tracking-wider">
              {isEdit
                ? 'Update task details'
                : preSelectedAssignee
                  ? `Assign a new task to: ${preSelectedAssignee.name}`
                  : formData.assignedTo
                    ? `Assign a new task to: ${employees.find(e => e._id === formData.assignedTo)?.name || 'Team Member'}`
                    : 'Assign a new task to your team'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {}
        <div className="overflow-visible">
          <form onSubmit={handleSubmit} className="px-7 pt-6 pb-7 space-y-5">
          {}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Task Title</label>
            <input
              type="text"
              required
              disabled={isReadOnly}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-slate-400 transition-all outline-none text-slate-900 text-sm font-semibold placeholder-slate-400 bg-white disabled:bg-slate-50 disabled:text-slate-500"
              placeholder="Enter task title..."
            />
          </div>

          {}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Description</label>
            <textarea
              required
              disabled={isReadOnly}
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-slate-400 transition-all outline-none text-slate-900 text-sm font-semibold placeholder-slate-400 bg-white disabled:bg-slate-50 disabled:text-slate-500 resize-none"
              placeholder="Describe the task in detail..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {}
            <div className="space-y-2 relative" ref={priorityRef}>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Priority</label>
              <div className="relative">
                <button
                  type="button"
                  disabled={isReadOnly}
                  onClick={() => setPriorityDropdownOpen(!priorityDropdownOpen)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white border border-slate-200 shadow-sm rounded-xl text-sm font-bold text-slate-700 outline-none cursor-pointer transition-all hover:border-slate-300 disabled:bg-slate-50"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${formData.priority === 'High' ? 'bg-red-500' : formData.priority === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                    <span>{formData.priority}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${priorityDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {priorityDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setPriorityDropdownOpen(false)} />
                    <div className="absolute bottom-full left-0 mb-2 w-full bg-white border border-slate-100 rounded-xl shadow-xl z-[200] overflow-hidden py-1">
                      {['High', 'Medium', 'Low'].map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, priority: option });
                            setPriorityDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${formData.priority === option ? 'text-slate-900 font-bold bg-slate-50' : 'text-slate-500 font-semibold hover:bg-slate-50'}`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${option === 'High' ? 'bg-red-500' : option === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                            {option}
                          </div>
                          {formData.priority === option && <Check className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {}
            <div className="space-y-2 relative">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Due Date</label>
              <div className="relative flex items-center">
                <Calendar className="absolute left-4 z-10 w-4 h-4 text-slate-400 pointer-events-none" />
                <DatePicker
                  selected={formData.dueDate}
                  onChange={(date) => setFormData({ ...formData, dueDate: date })}
                  disabled={isReadOnly}
                  required
                  placeholderText="Select due date"
                  dateFormat="dd-MM-yyyy"
                  minDate={new Date()}
                  wrapperClassName="w-full"
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all outline-none text-slate-900 text-sm font-semibold bg-white disabled:bg-slate-50 disabled:text-slate-400"
                  popperPlacement="top-end"
                  popperClassName="task-date-popper"
                  renderCustomHeader={({
                    date,
                    decreaseMonth,
                    increaseMonth,
                    prevMonthButtonDisabled,
                    nextMonthButtonDisabled,
                  }) => (
                    <div className="flex items-center justify-between px-2 py-2 bg-white rounded-t-3xl">
                      <button
                        onClick={decreaseMonth}
                        disabled={prevMonthButtonDisabled}
                        type="button"
                        className="p-1.5 hover:bg-slate-50 rounded-full transition-colors disabled:opacity-30"
                      >
                        <ChevronLeft className="w-4 h-4 text-slate-600" />
                      </button>
                      <span className="text-sm font-bold text-slate-900">
                        {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
                      </span>
                      <button
                        onClick={increaseMonth}
                        disabled={nextMonthButtonDisabled}
                        type="button"
                        className="p-1.5 hover:bg-slate-50 rounded-full transition-colors disabled:opacity-30"
                      >
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                      </button>
                    </div>
                  )}
                  dayClassName={(date) => {
                    const classes = [];
                    if (date.getDay() === 0) classes.push("text-red-500 font-bold");
                    return classes.join(" ");
                  }}
                  calendarClassName="premium-calendar"
                />
              </div>
            </div>
          </div>

          {}
          {!preSelectedAssignee && !isEdit && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Assign To</label>
              <select
                required
                disabled={isEmployee || isEdit}
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-slate-400 transition-all outline-none text-slate-900 text-sm font-bold bg-white disabled:bg-slate-50 disabled:text-slate-500 appearance-none cursor-pointer"
              >
                <option value="">Select Assignee</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>{emp.name}</option>
                ))}
              </select>
              {loadingEmployees && <p className="text-[10px] text-slate-400 mt-1">Loading team members...</p>}
            </div>
          )}

            {}
              <div className="flex gap-3 pt-4">
                {isReadOnly ? (
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-3.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-bold text-xs uppercase tracking-widest active:scale-95"
                  >
                    Close
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-4 py-3.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-bold text-xs uppercase tracking-widest active:scale-95"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-4 py-3.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-bold text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    >
                      {submitting ? 'Saving...' : (isEdit ? 'Update Task' : 'Create Task')}
                    </button>
                  </>
                )}
              </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
