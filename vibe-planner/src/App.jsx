import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar as CalendarIcon,
  BookOpen,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  GraduationCap,
  CalendarDays,
  CheckCircle2,
  FileText
} from 'lucide-react';

// ==========================================================================
// Mock Initial Data
// ==========================================================================
const INITIAL_COURSES = [
  {
    id: 'course-1',
    code: 'MATH-201',
    name: 'Calculus II',
    instructor: 'Dr. Evelyn Carter',
    progress: 65,
    hoursSpent: 4.5,
    color: '#8b5cf6', // Violet
    prevExamScore: 82,
    targetGrade: 90,
    availableHours: 4,
    pastGrades: []
  },
  {
    id: 'course-2',
    code: 'CS-102',
    name: 'Algorithms & Data Structures',
    instructor: 'Prof. Alan Turing',
    progress: 48,
    hoursSpent: 6.0,
    color: '#06b6d4', // Cyan
    prevExamScore: 78,
    targetGrade: 88,
    availableHours: 5,
    pastGrades: []
  },
  {
    id: 'course-3',
    code: 'CHEM-221',
    name: 'Organic Chemistry',
    instructor: 'Dr. Sarah Lin',
    progress: 72,
    hoursSpent: 3.0,
    color: '#10b981', // Emerald
    prevExamScore: 88,
    targetGrade: 95,
    availableHours: 6,
    pastGrades: []
  },
  {
    id: 'course-4',
    code: 'HIST-105',
    name: 'World History',
    instructor: 'Prof. Thomas Beal',
    progress: 85,
    hoursSpent: 2.0,
    color: '#f43f5e', // Rose
    prevExamScore: 92,
    targetGrade: 95,
    availableHours: 3,
    pastGrades: []
  }
];

const INITIAL_ASSIGNMENTS = [
  {
    id: 'assign-1',
    courseId: 'course-1',
    title: 'Double Integrals Worksheet',
    dueDate: '2026-07-08',
    type: 'assignment'
  },
  {
    id: 'assign-2',
    courseId: 'course-2',
    title: 'BST Balancing Lab Submission',
    dueDate: '2026-07-12',
    type: 'project'
  },
  {
    id: 'assign-3',
    courseId: 'course-3',
    title: 'Resonance Structure Quiz Prep',
    dueDate: '2026-07-15',
    type: 'assignment'
  },
  {
    id: 'assign-4',
    courseId: 'course-4',
    title: 'French Revolution Essay Draft',
    dueDate: '2026-07-10',
    type: 'assignment'
  },
  {
    id: 'assign-5',
    courseId: 'course-1',
    title: 'Infinite Series Problem Set',
    dueDate: '2026-07-22',
    type: 'assignment'
  },
  {
    id: 'assign-6',
    courseId: 'course-2',
    title: 'Graph Traversal Final Project',
    dueDate: '2026-07-28',
    type: 'project'
  }
];

// Custom colors for new courses
const COURSE_COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f43f5e', '#f59e0b', '#3b82f6', '#ec4899'];

function App() {
  // ==========================================================================
  // States
  // ==========================================================================
  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [assignments, setAssignments] = useState(INITIAL_ASSIGNMENTS);
  
  // Date states (Default active is July 2026)
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 5)); // July 5, 2026
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 6, 8)); // Focused on July 8, 2026 (Math assignment due)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');

  // Course Detail Modal Window States
  const [selectedCourseIdForModal, setSelectedCourseIdForModal] = useState(null);
  const [isLogHoursOpen, setIsLogHoursOpen] = useState(false);
  const [logHoursAmount, setLogHoursAmount] = useState('1');
  const [isAddAssignmentOpen, setIsAddAssignmentOpen] = useState(false);
  const [newAssignmentTitle, setNewAssignmentTitle] = useState('');
  const [newAssignmentDueDate, setNewAssignmentDueDate] = useState('2026-07-05');
  const [newAssignmentType, setNewAssignmentType] = useState('assignment');
  const [newAssignmentMaterial, setNewAssignmentMaterial] = useState('');
  const [newPastGradeInput, setNewPastGradeInput] = useState('');
  const [newPastGradeType, setNewPastGradeType] = useState('Quiz');
  const [newPastGradeLabel, setNewPastGradeLabel] = useState('1');

  // Trigger a mock update API endpoint when Current Grade average changes
  const updateCourseGrade = async (courseId, newGrade) => {
    try {
      console.log(`PAYLOAD: POST /api/courses/${courseId}/grade`, { currentGrade: newGrade });
      await fetch(`/api/courses/${courseId}/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentGrade: newGrade })
      });
    } catch (e) {
      console.log("Mock API Fallback: currentGrade updated locally.");
    }
  };

  // Handle Log Hours Submission
  const handleLogHoursSubmit = (e, courseId) => {
    e.preventDefault();
    const amt = parseFloat(logHoursAmount);
    if (isNaN(amt) || amt <= 0) return;
    
    setCourses(prevCourses => 
      prevCourses.map(c => 
        c.id === courseId ? { ...c, hoursSpent: c.hoursSpent + amt } : c
      )
    );
    setIsLogHoursOpen(false);
    setLogHoursAmount('1');
  };

  // Handle Add Assignment Submission
  const handleAddAssignmentSubmit = (e, courseId) => {
    e.preventDefault();
    if (!newAssignmentTitle.trim()) return;
    
    const newAssign = {
      id: `assign-${Date.now()}`,
      courseId: courseId,
      title: newAssignmentTitle,
      dueDate: newAssignmentDueDate,
      type: newAssignmentType,
      material: newAssignmentMaterial
    };
    
    setAssignments(prev => [...prev, newAssign]);
    setIsAddAssignmentOpen(false);
    setNewAssignmentTitle('');
    setNewAssignmentMaterial('');
  };

  // Handle Add Past Grade Score (with Quiz, Midterm, Exam type support)
  const handleAddPastGrade = async (courseId) => {
    const val = parseFloat(newPastGradeInput);
    if (isNaN(val) || val < 0 || val > 100) return;
    
    let fullName = newPastGradeType;
    if (newPastGradeLabel.trim()) {
      fullName = `${newPastGradeType} ${newPastGradeLabel.trim()}`;
    }
    const newGradeObj = { name: fullName, score: val };

    setCourses(prev =>
      prev.map(c =>
        c.id === courseId
          ? { ...c, pastGrades: [...(c.pastGrades || []), newGradeObj] }
          : c
      )
    );

    // Sync past grade updates to backend database mock
    try {
      console.log(`PAYLOAD: POST /api/courses/${courseId}/past-grades`, newGradeObj);
      await fetch(`/api/courses/${courseId}/past-grades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGradeObj)
      });
    } catch(e) {}

    setNewPastGradeInput('');
    setNewPastGradeLabel('');
  };

  // Whiteboard New Registration Fields State
  const [syllabusFile, setSyllabusFile] = useState(null); // Actual File object
  const fileInputRef = useRef(null);
  const [newPrevScore, setNewPrevScore] = useState(''); // Single baseline exam score input
  const [newAvailableHours, setNewAvailableHours] = useState(4); // Study target available hours/wk
  const [newTargetGrade, setNewTargetGrade] = useState(90); // Target grade (%)
  
  const [newStartDate, setNewStartDate] = useState('2026-07-05'); // Current date baseline
  const [newPrevStudyHours, setNewPrevStudyHours] = useState(0); // Previous study hours already completed

  // AI Summary States
  const [isGenerating, setIsGenerating] = useState(false);
  const [llmSummaryText, setLlmSummaryText] = useState('');
  const streamingIndexRef = useRef(0);
  const streamingIntervalRef = useRef(null);

  // Helper to offset dates
  const getOffsetDateString = (dateStr, daysOffset) => {
    try {
      const d = new Date(dateStr);
      d.setDate(d.getDate() + daysOffset);
      return d.toISOString().split('T')[0];
    } catch (e) {
      return '2026-07-15';
    }
  };

  // Local fallback generator if API key is not configured
  const generateLocalAISummary = (currentCourses, currentAssignments) => {
    let text = `⚡ Lumina Local Insights [API Key not configured in .env]:\n\n`;
    
    currentCourses.forEach(course => {
      const courseAssignments = currentAssignments.filter(a => a.courseId === course.id);
      const pendingText = courseAssignments.length > 0
        ? courseAssignments.map(a => `• ${a.title} (Due: ${a.dueDate})`).join('\n  ')
        : '• No pending deadlines';
        
      text += `📘 [${course.code}] ${course.name}\n`;
      text += `   Progress: ${course.progress}%  |  Focus Time: ${course.hoursSpent} hrs logged\n`;
      if (course.availableHours) {
        text += `   Weekly Target Hours: ${course.availableHours} hrs/wk\n`;
      }
      if (course.prevExamScores && course.prevExamScores.length > 0) {
        const avg = (course.prevExamScores.reduce((a, b) => a + b, 0) / course.prevExamScores.length).toFixed(1);
        text += `   Baseline Scores: ${course.prevExamScores.join(', ')}% (Avg: ${avg}%)\n`;
      }
      text += `   Upcoming Deadlines:\n  ${pendingText}\n\n`;
    });

    text += `💡 Recommendation:\n`;
    const lowProgressCourse = [...currentCourses].sort((a, b) => a.progress - b.progress)[0];
    if (lowProgressCourse) {
      text += `- focus on ${lowProgressCourse.code} (${lowProgressCourse.name}) first as progress is at ${lowProgressCourse.progress}%.\n`;
    }
    
    const totalHours = currentCourses.reduce((sum, c) => sum + c.hoursSpent, 0);
    text += `- Study total is ${totalHours} hours. Configure VITE_OPENROUTER_API_KEY in .env to enable live Qwen 2.5 summary reports!`;

    return text;
  };

  // Fetch analysis from Qwen on OpenRouter
  const fetchQwenAnalysis = async (currentCourses, currentAssignments) => {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    const isMock = !apiKey || apiKey === 'YOUR_OPENROUTER_API_KEY' || apiKey.trim() === '';
    
    if (isMock) {
      const fallbackText = generateLocalAISummary(currentCourses, currentAssignments);
      startStreamingText(fallbackText);
      return;
    }

    setIsGenerating(true);
    setLlmSummaryText('Querying Qwen 2.5 via OpenRouter for profile insights...');

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5174/",
          "X-Title": "VibePlanner"
        },
        body: JSON.stringify({
          model: "qwen/qwen-2.5-72b-instruct",
          messages: [
            {
              role: "system",
              content: "You are an expert academic advisor and study planner. Provide a clean, structured study analysis of the student's courses and deadlines. Give advice on study allocation, identify any immediate due items, and offer encouragement. Format in neat Markdown. Keep it brief and focused."
            },
            {
              role: "user",
              content: `Here is my current academic profile:
Courses: ${JSON.stringify(currentCourses.map(c => ({ code: c.code, name: c.name, progress: c.progress, hoursSpent: c.hoursSpent, availableHours: c.availableHours, syllabusUploaded: !!c.syllabusName, baselineExamScores: c.prevExamScores })))}
Upcoming Deadlines: ${JSON.stringify(currentAssignments.map(a => ({ title: a.title, dueDate: a.dueDate, type: a.type, material: a.material })))}
`
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const recommendation = data.recommendations.courses[0];
      const content = data.choices[0]?.message?.content || 'No insights returned.';
      startStreamingText(content);
    } catch (error) {
      console.error("OpenRouter Fetch Error:", error);
      const fallbackText = `⚠️ Error fetching Qwen AI Insights: ${error.message}\n\n[Verify your OpenRouter API key in the .env file is correct and active]\n\n` + generateLocalAISummary(currentCourses, currentAssignments);
      startStreamingText(fallbackText);
    } finally {
      setIsGenerating(false);
    }
  };

  // Simulated backend syllabus deadline extractor
  const getSimulatedBackendSyllabusDeadlines = (courseCode, startDate) => {
    return [
      {
        title: `${courseCode.toUpperCase()} Intro Homework`,
        dueDate: getOffsetDateString(startDate, 5),
        type: 'assignment',
        material: 'Introductory chapters and syllabus checklist'
      },
      {
        title: `${courseCode.toUpperCase()} Midterm Exam`,
        dueDate: getOffsetDateString(startDate, 15),
        type: 'exam',
        material: 'Core course modules, problem sets, and key theorems'
      },
      {
        title: `${courseCode.toUpperCase()} Final Project`,
        dueDate: getOffsetDateString(startDate, 26),
        type: 'project',
        material: 'Comprehensive application and summary deliverable'
      }
    ];
  };

  // Streaming Text Typer
  const startStreamingText = (targetText) => {
    if (streamingIntervalRef.current) {
      clearInterval(streamingIntervalRef.current);
    }

    setLlmSummaryText('');
    streamingIndexRef.current = 0;

    streamingIntervalRef.current = setInterval(() => {
      if (streamingIndexRef.current < targetText.length) {
        setLlmSummaryText(prev => prev + targetText.charAt(streamingIndexRef.current));
        streamingIndexRef.current += 1;
      } else {
        clearInterval(streamingIntervalRef.current);
      }
    }, 6);
  };

  const startStreamingSummary = (targetText) => {
    // Clear any active intervals
    if (streamingIntervalRef.current) {
      clearInterval(streamingIntervalRef.current);
    }

    setIsGenerating(true);
    setLlmSummaryText('');
    streamingIndexRef.current = 0;

    streamingIntervalRef.current = setInterval(() => {
      if (streamingIndexRef.current < targetText.length) {
        setLlmSummaryText(prev => prev + targetText.charAt(streamingIndexRef.current));
        streamingIndexRef.current += 1;
      } else {
        clearInterval(streamingIntervalRef.current);
        setIsGenerating(false);
      }
    }, 8); // Fast typing speed
  };

  // Generate on load
  useEffect(() => {
    const fetchProfileFromBackend = async () => {
      try {
        const resCourses = await fetch('/api/courses');
        if (resCourses.ok) {
          const coursesData = await resCourses.json();
          setCourses(coursesData);
        }
        
        const resAssignments = await fetch('/api/assignments');
        if (resAssignments.ok) {
          const assignmentsData = await resAssignments.json();
          setAssignments(assignmentsData);
        }
      } catch (e) {
        console.log("Simulating profile fetch: No backend API active. Falling back to local placeholder data.");
      }
    };

    fetchProfileFromBackend();

    return () => {
      if (streamingIntervalRef.current) clearInterval(streamingIntervalRef.current);

    };
  }, []);

  const handleRegenerateSummary = () => {
    fetchQwenAnalysis(courses, assignments);
  };

  // ==========================================================================
  // Calendar Grid Calculations (Dynamic Month Grid)
  // ==========================================================================
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

  const daysInCurrentMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month); // Day index for 1st of month

  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

  const calendarDays = [];

  // 1. Fill leading dates from previous month
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    calendarDays.push({
      date: new Date(prevYear, prevMonth, daysInPrevMonth - i),
      isCurrentMonth: false
    });
  }

  // 2. Fill dates of active month
  for (let i = 1; i <= daysInCurrentMonth; i++) {
    calendarDays.push({
      date: new Date(year, month, i),
      isCurrentMonth: true
    });
  }

  // 3. Fill trailing dates for next month
  const totalCells = 42; // standard 6-row calendar grid
  const remainingCells = totalCells - calendarDays.length;
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;

  for (let i = 1; i <= remainingCells; i++) {
    calendarDays.push({
      date: new Date(nextYear, nextMonth, i),
      isCurrentMonth: false
    });
  }

  // Month navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleGoToToday = () => {
    const today = new Date(2026, 6, 5); // Default study mock time: July 5, 2026
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Compare dates helper
  const isSameDate = (d1, d2) => {
    if (!d1 || !d2) return false;
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  };

  // Check if a day has assignments due
  const getAssignmentsDueOnDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return assignments.filter(a => a.dueDate === dateStr);
  };

  const selectedDateEvents = selectedDate ? getAssignmentsDueOnDate(selectedDate) : [];

  // ==========================================================================
  // Register Course Handlers
  // ==========================================================================
  const handleRegisterCourse = async (e) => {
    e.preventDefault();
    if (!newCourseCode.trim() || !newCourseName.trim()) return;

    setIsGenerating(true);
    setLlmSummaryText('Registering course and analyzing profile details...');

    // 1. Construct FormData for backend processing
    const formData = new FormData();
    formData.append('code', newCourseCode.toUpperCase());
    formData.append('name', newCourseName);
    formData.append('availableHours', newAvailableHours);
    formData.append('targetGrade', newTargetGrade);
    formData.append('startDate', newStartDate);
    formData.append('prevStudyHours', newPrevStudyHours);
    formData.append('prevExamScore', parseFloat(newPrevScore) || 0.0);
    if (syllabusFile) {
      formData.append('syllabus', syllabusFile); // Actual binary file!
    }

    // Print form data keys and values in the console to show exact payload format
    console.log("==================================================");
    console.log("PAYLOAD: POST /api/courses/register [FormData]");
    for (let [key, val] of formData.entries()) {
      if (val instanceof File) {
        console.log(`- ${key}: File [name: "${val.name}", size: ${val.size} bytes]`);
      } else {
        console.log(`- ${key}:`, val);
      }
    }
    console.log("==================================================");

    // 2. Simulate API Call to backend
    try {
      // In a real project, this sends the FormData directly to your server/API
      const response = await fetch(
        '/api/courses/register',
        {
          method: 'POST',
          body: formData
        }
      );
      
      const data = await response.json();
      
      console.log(data);
    } catch (err) {
      console.log("Simulating backend integration: No backend API endpoint active. Processing local simulation...");
    }

    // 3. Process local mock states (acting as the backend's completed response)
    const courseId = `course-${Date.now()}`;
    const randomColor = COURSE_COLORS[Math.floor(Math.random() * COURSE_COLORS.length)];
    const syllabusFilename = syllabusFile ? syllabusFile.name : `${newCourseCode.toUpperCase()}_Syllabus.pdf`;

    const parsedDeadlines = getSimulatedBackendSyllabusDeadlines(
      newCourseCode,
      newStartDate
    );

    const newCourse = {
      id: courseId,
      code: newCourseCode.toUpperCase(),
      name: newCourseName,
      instructor: 'Self-Directed',
      progress: 0,
      hoursSpent: parseFloat(newPrevStudyHours) || 0,
      color: randomColor,
    
      recommendation: recommendation,
    
      syllabusName: syllabusFilename,
      prevExamScore: parseFloat(newPrevScore) || 0,
      availableHours: parseInt(newAvailableHours) || 4,
      targetGrade: parseInt(newTargetGrade) || 90,
      startDate: newStartDate
    };

    const newCourseAssignments = parsedDeadlines.map((d, index) => ({
      id: `assign-${Date.now()}-${index}`,
      courseId: courseId,
      title: d.title,
      dueDate: d.dueDate,
      type: d.type || 'assignment',
      material: d.material || ''
    }));

    const updatedCourses = [...courses, newCourse];
    const updatedAssignments = [...assignments, ...newCourseAssignments];

    setCourses(updatedCourses);
    setAssignments(updatedAssignments);

    // Reset Form States
    setNewCourseCode('');
    setNewCourseName('');
    setSyllabusFile(null);
    setNewPrevScore('');
    setNewAvailableHours(4);
    setNewTargetGrade(90);
    setNewStartDate('2026-07-05');
    setNewPrevStudyHours(0);
    
    setIsModalOpen(false);
    setSelectedCourseIdForModal(courseId);

    // Trigger profile summary analysis using Qwen on OpenRouter
    await fetchQwenAnalysis(updatedCourses, updatedAssignments);
  };

  return (
    <div className="dashboard-wrapper">
      {/* ==========================================================================
         Dashboard Top Header
         ========================================================================== */}
      <header className="dashboard-header">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <GraduationCap className="w-6 h-6 text-purple-400" />
            <h1 className="text-xl font-bold tracking-tight text-white m-0" style={{ fontSize: '1.5rem' }}>
              VibePlanner
            </h1>
          </div>
          <p className="text-sm text-gray-400">
            Welcome back! Manage your calendar, courses, and check AI-generated schedule insights.
          </p>
        </div>

        <div className="flex gap-3">
          <button onClick={handleGoToToday} className="btn">
            Today
          </button>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            <Plus className="w-4 h-4" /> Register Course
          </button>
        </div>
      </header>

      {/* ==========================================================================
         Main Workspace Layout (Stable Split Column)
         ========================================================================== */}
      <div className="dashboard-grid">
        {/* Left Column: Registered Course directory and AI study tracker insights */}
        <div className="flex flex-col gap-6">
          {/* Registered Courses Directory Card */}
          <section className="card">
            <div className="card-title-bar">
              <h2>
                <BookOpen className="w-5 h-5 text-purple-400" /> Course Directory
              </h2>
              <span className="text-xs text-gray-400 font-semibold">{courses.length} active classes</span>
            </div>

            <div className="course-grid">
              {courses.map((course) => {
                const pendingCount = assignments.filter(a => a.courseId === course.id).length;
                return (
                  <div
                    key={course.id}
                    onClick={() => {
                      setSelectedCourseIdForModal(course.id);
                      setIsLogHoursOpen(false);
                      setIsAddAssignmentOpen(false);
                    }}
                    className="course-card cursor-pointer hover:border-white/10"
                  >
                    {/* Accent Color bar */}
                    <div className="course-card-accent" style={{ backgroundColor: course.color }} />
                    
                    <div className="course-meta">
                      <span className="course-code">{course.code}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 border border-white/5 text-gray-300">
                        {pendingCount} Pending
                      </span>
                    </div>

                    <div>
                      <h3 className="course-name mb-0.5 text-white">{course.name}</h3>
                    </div>

                    <div className="flex flex-col gap-1 text-[11px] text-gray-400 mt-1 border-t border-white/5 pt-2">
                      {(course.prevExamScore !== undefined || course.prevExamScores) && (
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                          <span>
                            Baseline Score: {course.prevExamScore !== undefined 
                              ? `${course.prevExamScore}%` 
                              : (course.prevExamScores && course.prevExamScores.length > 0 
                                  ? `${(course.prevExamScores.reduce((a,b)=>a+b,0)/course.prevExamScores.length).toFixed(1)}%` 
                                  : 'N/A')}
                          </span>
                        </div>
                      )}

                      {course.availableHours && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-blue-400" />
                          <span>Target Available: {course.availableHours} hrs/wk</span>
                        </div>
                      )}
                      
                      {course.targetGrade && (
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" style={{ color: 'var(--primary)' }} />
                          <span>Target Grade: {course.targetGrade}%</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-2 pt-2 border-t border-white/5">
                      <div className="course-stats justify-end">
                        <span>Logged Study: <strong className="course-stats-num text-purple-400">{course.hoursSpent} hrs</strong></span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* AI insights container */}
          <section className="card ai-summary-card">
            <div className="card-title-bar">
              <div className="flex items-center gap-3">
                <h2>
                  <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" /> AI Study Insights
                </h2>
                <div className="ai-tag">Qwen 2.5</div>
              </div>

              <div className="flex items-center gap-3">
                {isGenerating && (
                  <div className="generating-badge">
                    <div className="spinner" /> Analyzing data...
                  </div>
                )}
                {llmSummaryText && (
                  <button
                    onClick={handleRegenerateSummary}
                    disabled={isGenerating}
                    className="btn text-xs font-semibold py-1.5"
                  >
                    Regenerate
                  </button>
                )}
              </div>
            </div>

            <div className="ai-summary-content font-mono text-xs">
              {llmSummaryText ? (
                <>
                  {llmSummaryText}
                  {isGenerating && <span className="typing-cursor" />}
                </>
              ) : (
                !isGenerating && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Sparkles className="w-8 h-8 text-purple-400 mb-2.5 opacity-60 animate-pulse" />
                    <p className="text-[11px] text-gray-400 max-w-[320px] mb-4 leading-relaxed">
                      Compile your registered course load, weekly target study hours, and current grade averages to generate tailored academic recommendations from Qwen 2.5.
                    </p>
                    <button
                      onClick={handleRegenerateSummary}
                      className="btn btn-primary px-5 py-2 text-xs flex items-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Generate Qwen Study Insights
                    </button>
                  </div>
                )
              )}
              {isGenerating && !llmSummaryText && (
                <div className="text-gray-500 italic py-4 text-center">
                  Connecting to OpenRouter and analyzing profile data...
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Calendar Grid & Day Event Details */}
        <div className="flex flex-col gap-6">
          {/* Monthly Calendar Card */}
          <section className="card">
            <div className="calendar-header">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-purple-400" />
                <h3 className="calendar-month-title">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
              </div>

              <div className="flex gap-1">
                <button onClick={handlePrevMonth} className="btn btn-icon-only">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={handleNextMonth} className="btn btn-icon-only">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Grid Header Days */}
            <div className="calendar-grid-header">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day}>{day}</div>
              ))}
            </div>

            {/* Grid Date Cells */}
            <div className="calendar-grid-days">
              {calendarDays.map((cell, idx) => {
                const dayAssignments = getAssignmentsDueOnDate(cell.date);
                const isSelected = isSameDate(cell.date, selectedDate);
                const isToday = isSameDate(cell.date, new Date(2026, 6, 5)); // static system date July 5, 2026

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedDate(cell.date)}
                    className={`calendar-cell ${
                      !cell.isCurrentMonth ? 'calendar-cell-other-month' : ''
                    } ${isToday ? 'calendar-cell-today' : ''} ${
                      isSelected ? 'calendar-cell-selected' : ''
                    }`}
                  >
                    <span>{cell.date.getDate()}</span>
                    
                    {/* Dots for items due */}
                    {dayAssignments.length > 0 && (
                      <div className="calendar-dots-container">
                        {dayAssignments.slice(0, 3).map((assignment, dotIdx) => {
                          const course = courses.find(c => c.id === assignment.courseId);
                          return (
                            <span
                              key={dotIdx}
                              className="calendar-dot"
                              style={{ backgroundColor: course ? course.color : '#8b5cf6' }}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Selected Date Detail List (Spacious & Clean) */}
            {selectedDate && (
              <div className="events-list-container">
                <h4 className="events-title">
                  Deadlines due: {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </h4>

                {selectedDateEvents.length === 0 ? (
                  <div className="flex flex-col items-center py-6 text-center text-gray-500 gap-1.5">
                    <CheckCircle2 className="w-6 h-6 text-green-500/50" />
                    <span className="text-xs">No deadlines or tasks scheduled for today.</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {selectedDateEvents.map((item) => {
                      const course = courses.find(c => c.id === item.courseId);
                      return (
                        <div key={item.id} className="event-item">
                          <div
                            className="event-course-tag"
                            style={{ backgroundColor: course ? course.color : '#8b5cf6' }}
                          />
                          <div className="event-details">
                            <span className="event-name">{item.title}</span>
                            <div className="flex items-center gap-1.5 event-time">
                              <span className="font-semibold" style={{ color: course ? course.color : '#8b5cf6' }}>
                                {course ? course.code : 'Study'}
                              </span>
                              <span>•</span>
                              <span className="capitalize">{item.type}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* ==========================================================================
         Course Detail Modal Window overlay
         ========================================================================== */}
      {selectedCourseIdForModal && (
        (() => {
          const selectedCourse = courses.find(c => c.id === selectedCourseIdForModal);
          if (!selectedCourse) return null;
          const courseAssignments = assignments.filter(a => a.courseId === selectedCourse.id);

          return (
            <div className="modal-backdrop">
              <div className="modal-content" style={{ maxWidth: '800px', width: '95%' }}>
                <div className="modal-header">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedCourse.color }} />
                    Course Details — {selectedCourse.code}
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedCourseIdForModal(null);
                      setIsLogHoursOpen(false);
                      setIsAddAssignmentOpen(false);
                    }}
                    className="btn btn-icon-only border-none hover:bg-white/5"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                <div className="modal-split-container mt-3">
                  {/* Left Sidebar: Recommendations */}
                  <div className="course-sidebar">
                    <span className="course-sidebar-title flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" /> Recommendations
                    </span>
                    <div className="course-sidebar-content font-sans text-xs flex flex-col gap-4">
                      <div className="p-3 bg-black/20 border border-white/5 rounded-xl flex flex-col gap-3">
                        <div className="flex justify-between items-center py-0.5">
                          <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Target Grade</span>
                          <span className="text-white font-mono font-bold text-xs">
                            {selectedCourse.targetGrade !== undefined ? `${selectedCourse.targetGrade}%` : 'N/A'}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center py-0.5">
                          <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Current Grade</span>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={selectedCourse.prevExamScore !== undefined ? selectedCourse.prevExamScore : ''}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                const nextGrade = isNaN(val) ? 0 : val;
                                setCourses(prev =>
                                  prev.map(c =>
                                    c.id === selectedCourse.id
                                      ? { ...c, prevExamScore: nextGrade }
                                      : c
                                  )
                                );
                                updateCourseGrade(selectedCourse.id, nextGrade);
                              }}
                              className="input-text input-sm font-mono font-bold text-center"
                              style={{ width: '56px' }}
                            />
                            <span className="text-gray-300 font-bold text-[10px]">%</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center py-0.5">
                          <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Allocated target</span>
                          <span className="text-white font-mono font-bold text-xs">
                            {selectedCourse.availableHours !== undefined ? `${selectedCourse.availableHours} hrs/wk` : 'TBD'}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 bg-black/20 border border-white/5 rounded-xl">
                        <h4 className="font-bold mb-2">
                          AI Recommendation
                        </h4>

                        <p>
                          <strong>Hours:</strong>{" "}
                          {selectedCourse.recommendation?.recommended_hours ?? "N/A"}
                        </p>

                        <p className="mt-2">
                          <strong>Topics:</strong>
                        </p>

                        <ul className="ml-4 list-disc">
                          {selectedCourse.recommendation?.recommended_topics?.map(
                            (topic, idx) => (
                              <li key={idx}>{topic}</li>
                            )
                          )}
                        </ul>

                        <p className="mt-2 text-xs text-gray-400">
                          {selectedCourse.recommendation?.reasoning}
                        </p>
                      </div>
                      
                      {/* Past Quiz / Exam Grades Section */}
                      <div className="border-t border-white/5 pt-3 flex flex-col gap-2">
                        <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider mb-1">Past quiz/exam grades</span>
                        
                        <div className="grid grid-cols-2 gap-1.5">
                          <div className="input-group">
                            <label className="input-label text-[8px] uppercase tracking-wider mb-0.5">Type</label>
                            <select
                              value={newPastGradeType}
                              onChange={(e) => setNewPastGradeType(e.target.value)}
                              className="select-input input-sm"
                            >
                              <option value="Quiz">Quiz</option>
                              <option value="Midterm">Midterm</option>
                              <option value="Exam">Exam</option>
                              <option value="Final">Final</option>
                            </select>
                          </div>
                          <div className="input-group">
                            <label className="input-label text-[8px] uppercase tracking-wider mb-0.5">Label / #</label>
                            <input
                              type="text"
                              placeholder="e.g. 1"
                              value={newPastGradeLabel}
                              onChange={(e) => setNewPastGradeLabel(e.target.value)}
                              className="input-text input-sm"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 items-center">
                          <div className="flex-1 input-group">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              placeholder="Score (%)"
                              value={newPastGradeInput}
                              onChange={(e) => setNewPastGradeInput(e.target.value)}
                              className="input-text input-sm"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddPastGrade(selectedCourse.id)}
                            className="btn btn-primary input-sm px-3 font-bold"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            Add Grade
                          </button>
                        </div>
                        
                        <div className="flex flex-col gap-1.5 max-h-[110px] overflow-y-auto mt-1 pr-1">
                          {selectedCourse.pastGrades && selectedCourse.pastGrades.length > 0 ? (
                            selectedCourse.pastGrades.map((g, idx) => (
                              <div key={idx} className="flex justify-between items-center py-1 border-b border-white/5 last:border-0">
                                <span className="font-semibold text-gray-400">{g.name}</span>
                                <span className="font-bold text-purple-300 font-mono">{g.score}%</span>
                              </div>
                            ))
                          ) : (
                            <span className="text-[10px] text-gray-500 italic">No past scores recorded.</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Right Content Area: Milestones and Actions */}
                  <div className="course-main-content">
                    <div>
                      <div className="flex justify-between items-start border-b border-white/5 pb-3 mb-3">
                        <div>
                          <h2 className="text-base font-bold text-white leading-tight">{selectedCourse.name}</h2>
                          <span className="text-[10px] text-gray-400 mt-1 block">Syllabus: {selectedCourse.syllabusName || 'Unlinked'}</span>
                        </div>
                        <div className="flex flex-col items-end gap-0.5 text-right">
                          <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Logged Focus</span>
                          <span className="text-sm font-mono font-bold text-purple-400">{selectedCourse.hoursSpent} hrs</span>
                        </div>
                      </div>

                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">Course Assignments &amp; Milestones</h4>
                      
                      <div className="assignments-list-container pr-1" style={{ maxHeight: '200px' }}>
                        {courseAssignments.length === 0 ? (
                          <div className="text-center py-6 text-gray-500 text-xs">
                            No assignments registered for this course yet.
                          </div>
                        ) : (
                          courseAssignments.map((dl) => (
                            <div key={dl.id} className="assignment-item-card mb-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="font-bold text-white text-xs">{dl.title}</span>
                                  {dl.material && (
                                    <p className="text-[10px] text-gray-400 mt-0.5">Topics: {dl.material}</p>
                                  )}
                                </div>
                                <div className="text-right flex flex-col items-end gap-1">
                                  <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-white/5 border border-white/5 text-gray-300 capitalize">
                                    {dl.type}
                                  </span>
                                  <span className="text-[9px] text-gray-400 font-mono">Due {dl.dueDate}</span>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Inline Form Expanders */}
                      {isLogHoursOpen && (
                        <form
                          onSubmit={(e) => handleLogHoursSubmit(e, selectedCourse.id)}
                          className="mt-3 p-3 bg-black/20 border border-white/5 rounded-xl flex gap-3 items-end"
                        >
                          <div className="input-group flex-1">
                            <label className="input-label text-[10px]">Add study hours</label>
                            <input
                              type="number"
                              step="0.5"
                              min="0.5"
                              max="12"
                              value={logHoursAmount}
                              onChange={(e) => setLogHoursAmount(e.target.value)}
                              className="input-text text-xs"
                              style={{ height: '36px' }}
                              required
                              autoFocus
                            />
                          </div>
                          <button type="submit" className="btn btn-primary text-xs" style={{ height: '36px' }}>Save Log</button>
                          <button type="button" onClick={() => setIsLogHoursOpen(false)} className="btn text-xs" style={{ height: '36px' }}>Cancel</button>
                        </form>
                      )}

                      {isAddAssignmentOpen && (
                        <form
                          onSubmit={(e) => handleAddAssignmentSubmit(e, selectedCourse.id)}
                          className="mt-3 p-3 bg-black/20 border border-white/5 rounded-xl flex flex-col gap-3"
                        >
                          <span className="text-xs font-bold text-white">Create New Milestone</span>
                          <div className="input-group">
                            <label className="input-label text-[10px]">Milestone Title</label>
                            <input
                              type="text"
                              placeholder="e.g. Project Phase 2"
                              value={newAssignmentTitle}
                              onChange={(e) => setNewAssignmentTitle(e.target.value)}
                              className="input-text text-xs"
                              style={{ height: '36px' }}
                              required
                              autoFocus
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="input-group">
                              <label className="input-label text-[10px]">Due Date</label>
                              <input
                                type="date"
                                value={newAssignmentDueDate}
                                onChange={(e) => setNewAssignmentDueDate(e.target.value)}
                                className="input-text text-xs"
                                style={{ height: '36px' }}
                                required
                              />
                            </div>
                            <div className="input-group">
                              <label className="input-label text-[10px]">Type</label>
                              <select
                                value={newAssignmentType}
                                onChange={(e) => setNewAssignmentType(e.target.value)}
                                className="select-input text-xs"
                                style={{ height: '36px' }}
                                required
                              >
                                <option value="assignment">Assignment</option>
                                <option value="exam">Exam</option>
                                <option value="project">Project / Lab</option>
                              </select>
                            </div>
                          </div>
                          <div className="input-group">
                            <label className="input-label text-[10px]">Topics Covered</label>
                            <input
                              type="text"
                              placeholder="e.g. Chapter 4 materials"
                              value={newAssignmentMaterial}
                              onChange={(e) => setNewAssignmentMaterial(e.target.value)}
                              className="input-text text-xs"
                              style={{ height: '36px' }}
                              required
                            />
                          </div>
                          <div className="flex gap-2 justify-end">
                            <button type="button" onClick={() => setIsAddAssignmentOpen(false)} className="btn text-xs" style={{ height: '32px' }}>Cancel</button>
                            <button type="submit" className="btn btn-primary text-xs" style={{ height: '32px' }}>Save Milestone</button>
                          </div>
                        </form>
                      )}
                    </div>

                    {/* Footer buttons */}
                    {!isLogHoursOpen && !isAddAssignmentOpen && (
                      <div className="flex gap-2 justify-end border-t border-white/5 pt-3 mt-4">
                        <button
                          onClick={() => {
                            setIsLogHoursOpen(true);
                            setIsAddAssignmentOpen(false);
                          }}
                          className="btn text-xs py-1.5 flex items-center gap-1.5"
                        >
                          <Clock className="w-3.5 h-3.5 text-blue-400" /> Log Focus
                        </button>
                        <button
                          onClick={() => {
                            setIsAddAssignmentOpen(true);
                            setIsLogHoursOpen(false);
                          }}
                          className="btn btn-primary text-xs py-1.5 flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Milestone
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()
      )}

      {/* ==========================================================================
         Course Registration Modal
         ========================================================================== */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-purple-400" /> Register New Course
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="btn btn-icon-only border-none hover:bg-white/5"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleRegisterCourse} className="flex flex-col gap-4">
              
              {/* Section 1: Course Info */}
              <h4 className="form-section-title">Course Information</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="input-group">
                  <label className="input-label">Course Code</label>
                  <input
                    type="text"
                    placeholder="e.g. PHYS-101"
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    className="input-text"
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Course Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Physics Mechanics"
                    value={newCourseName}
                    onChange={(e) => setNewCourseName(e.target.value)}
                    className="input-text"
                    required
                  />
                </div>
              </div>

              {/* Section 2: Syllabus & Baselines */}
              <h4 className="form-section-title">Syllabus &amp; Baselines</h4>

              <div className="input-group">
                <label className="input-label">Syllabus PDF</label>
                
                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="application/pdf"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSyllabusFile(file);
                    }
                  }}
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="file-dropzone"
                >
                  <FileText className="w-6 h-6 text-purple-400" />
                  {syllabusFile ? (
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-bold text-white">{syllabusFile.name}</span>
                      <span className="text-[10px] text-gray-500">{(syllabusFile.size / 1024).toFixed(1)} KB • Click to change file</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-gray-300">Click to upload Syllabus PDF</span>
                      <span className="text-[10px] text-gray-500">Allows syllabus parser to automatically extract due dates</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Current Grade Score (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="e.g. 85"
                  value={newPrevScore}
                  onChange={(e) => setNewPrevScore(e.target.value)}
                  className="input-text"
                  required
                />
              </div>

              {/* Section 3: Time Metrics */}
              <h4 className="form-section-title">Hours &amp; Metrics</h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="input-group">
                  <label className="input-label">Available Study Hours (Wkly)</label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={newAvailableHours}
                    onChange={(e) => setNewAvailableHours(parseInt(e.target.value) || 0)}
                    className="input-text"
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Prev. Study Hours spent</label>
                  <input
                    type="number"
                    min="0"
                    value={newPrevStudyHours}
                    onChange={(e) => setNewPrevStudyHours(parseFloat(e.target.value) || 0)}
                    className="input-text"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="input-group">
                  <label className="input-label">Current Course Date (Start)</label>
                  <input
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="input-text"
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Target Grade (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="e.g. 90"
                    value={newTargetGrade}
                    onChange={(e) => setNewTargetGrade(parseInt(e.target.value) || 0)}
                    className="input-text"
                    required
                  />
                </div>
              </div>

              <div className="modal-footer border-t border-white/5 pt-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;