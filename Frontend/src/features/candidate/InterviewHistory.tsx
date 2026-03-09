import React, { useState, useEffect } from 'react'
import { CandidateNavHeader } from '../../components/common'
import './InterviewHistory.css'

interface Ratings {
    communication?: number
    technical?: number
    problemSolving?: number
    cultureFit?: number
    overall?: number
    [key: string]: number | undefined
}

interface ManualEvaluation {
    decision: string
    comments: string
    ratings?: Ratings
}

interface AIEvaluation {
    score: number
    summary: string
    decision: string
}

interface JobDescription {
    name: string
}

interface Interview {
    id: number
    jobDescription?: JobDescription
    companyName?: string
    scheduledAt?: string
    date?: string
    duration?: string
    interviewerName?: string
    status: string
    finalDecision?: string
    manualEvaluation?: ManualEvaluation | null
    aiEvaluation?: AIEvaluation | null
}

interface InterviewsResponse {
    interviews: Interview[]
}

interface InterviewHistoryProps {
    interviewsResponse?: InterviewsResponse
}

interface ExpandedRows {
    [key: number]: boolean
}


const InterviewHistory: React.FC<InterviewHistoryProps> = ({ interviewsResponse }) => {
    const [selectedRow, setSelectedRow] = useState<number | null>(null)
    const [filterStatus, setFilterStatus] = useState<string>('all')
    const [expandedRows, setExpandedRows] = useState<ExpandedRows>({})
    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy] = useState<'date' | 'score'>('date')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

    // fallback sample data
    const sampleInterviewHistory: Interview[] = [
        {
            id: 1,
            jobDescription: { name: 'Frontend Developer' },
            companyName: 'TechCorp Inc.',
            scheduledAt: '2024-01-10T14:00:00',
            duration: '45 minutes',
            interviewerName: 'Sarah Johnson',
            status: 'completed',
            finalDecision: 'hire',
            manualEvaluation: {
                decision: 'hire',
                comments:
                    'Strong technical skills and good communication. Demonstrated solid understanding of React concepts. Candidate solved the coding exercise with clear approach, used good variable names and explained trade-offs. Some minor edge cases were missed but overall very solid. Suggested practicing backend patterns.',
                ratings: { communication: 4, technical: 4, problemSolving: 3, cultureFit: 4, overall: 4 },
            },
            aiEvaluation: { score: 4.2, summary: 'AI voted hire after strong whiteboard session.', decision: 'hire' },
        },
        {
            id: 2,
            jobDescription: { name: 'React Developer' },
            companyName: 'InnovateTech',
            scheduledAt: '2024-01-08T10:30:00',
            duration: '60 minutes',
            interviewerName: 'Mike Chen',
            status: 'completed',
            finalDecision: 'hire',
            manualEvaluation: {
                decision: 'hire',
                comments:
                    'Excellent problem-solving skills and technical knowledge. Very well-prepared and articulate. Completed data-structures task, gave optimized solution and explained time/space complexity clearly. Minor syntax issues but overall outstanding.',
                ratings: { communication: 4, technical: 5, problemSolving: 5, cultureFit: 4, overall: 5 },
            },
            aiEvaluation: { score: 4.6, summary: 'AI recommended hire with high code quality score.', decision: 'hire' },
        },
        {
            id: 3,
            jobDescription: { name: 'Full Stack Developer' },
            companyName: 'CloudSoft Solutions',
            scheduledAt: '2024-01-05T16:00:00',
            duration: '90 minutes',
            interviewerName: 'Alex Rodriguez',
            status: 'rejected',
            finalDecision: 'no-hire',
            manualEvaluation: {
                decision: 'no-hire',
                comments:
                    'Needs more depth with backend systems. During system design, candidate missed scalability concerns and caching patterns. Frontend skills adequate but backend knowledge not production-ready for this role.',
                ratings: { communication: 3, technical: 2, problemSolving: 2, cultureFit: 3, overall: 2 },
            },
            aiEvaluation: { score: 2.8, summary: 'Recommendation: hold — lacks backend depth.', decision: 'hold' },
        },
        {
            id: 4,
            jobDescription: { name: 'Software Engineer' },
            companyName: 'DataDriven Labs',
            scheduledAt: '2024-01-03T11:00:00',
            duration: '75 minutes',
            interviewerName: 'Emily Watson',
            status: 'pending',
            finalDecision: 'hold',
            manualEvaluation: null,
            aiEvaluation: null,
        },
    ]

    const interviewsFromApi =
        typeof interviewsResponse !== 'undefined' &&
            interviewsResponse &&
            Array.isArray(interviewsResponse.interviews)
            ? interviewsResponse.interviews
            : []

    const interviewHistory = interviewsFromApi.length > 0 ? interviewsFromApi : sampleInterviewHistory

    // Helper function to get interviewer score - defined before it's used in sort
    const getInterviewerScore = (i: Interview): number | null => {
        const manual = i.manualEvaluation?.ratings?.overall
        if (typeof manual === 'number') return manual
        const ratings = i.manualEvaluation?.ratings
        if (ratings) {
            const vals = Object.values(ratings).filter((v): v is number => typeof v === 'number')
            if (vals.length) return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
        }
        return null
    }

    useEffect(() => {
        if (!selectedRow && interviewHistory.length > 0) {
            setSelectedRow(null)
        }
    }, [interviewHistory, selectedRow])

    // Apply filters, search, and sort
    let filtered = filterStatus === 'all' ? interviewHistory : interviewHistory.filter((i) => i.status === filterStatus)

    // Apply search
    if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        filtered = filtered.filter((i) =>
            (i.companyName?.toLowerCase().includes(query)) ||
            (i.interviewerName?.toLowerCase().includes(query))
        )
    }

    // Apply sort
    filtered = [...filtered].sort((a, b) => {
        if (sortBy === 'date') {
            const dateA = new Date(a.scheduledAt || a.date || 0).getTime()
            const dateB = new Date(b.scheduledAt || b.date || 0).getTime()
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
        } else { // sort by score
            const scoreA = getInterviewerScore(a) || 0
            const scoreB = getInterviewerScore(b) || 0
            return sortOrder === 'asc' ? scoreA - scoreB : scoreB - scoreA
        }
    })


    const formatDate = (dStr?: string): string => {
        if (!dStr) return ''
        const d = new Date(dStr)
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    }
    const formatTime = (dStr?: string): string => {
        if (!dStr) return ''
        const d = new Date(dStr)
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }


    const toggleExpandRow = (id: number, e?: React.MouseEvent<HTMLButtonElement>): void => {
        // prevent row click selection if toggle was clicked directly
        if (e) e.stopPropagation()
        setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }))
    }

    return (
        <div className="candidate-container">
            <div className="candidate-card full-width">
                <CandidateNavHeader title="INTERVIEW HISTORY" currentPage="history" />

                <div className="history-content-full">
                    <div className="history-main-full">
                        {/* Search and Sort Controls */}
                        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                            <div style={{ flex: 1, minWidth: 250 }}>
                                <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 6, fontWeight: 600 }}>Search Interviews</label>
                                <input
                                    type="text"
                                    placeholder="Search by company or interviewer..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        background: '#0f172a',
                                        border: '1px solid #334155',
                                        borderRadius: 8,
                                        color: '#e2e8f0',
                                        fontSize: 14
                                    }}
                                />
                            </div>
                            <div style={{ minWidth: 150 }}>
                                <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 6, fontWeight: 600 }}>Sort By</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as 'date' | 'score')}
                                    style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        background: '#0f172a',
                                        border: '1px solid #334155',
                                        borderRadius: 8,
                                        color: '#e2e8f0',
                                        fontSize: 14,
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="date">Date</option>
                                    <option value="score">Score</option>
                                </select>
                            </div>
                            <div style={{ minWidth: 120 }}>
                                <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 6, fontWeight: 600 }}>Order</label>
                                <select
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                                    style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        background: '#0f172a',
                                        border: '1px solid #334155',
                                        borderRadius: 8,
                                        color: '#e2e8f0',
                                        fontSize: 14,
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="desc">Newest First</option>
                                    <option value="asc">Oldest First</option>
                                </select>
                            </div>
                            {(searchQuery || sortBy !== 'date' || sortOrder !== 'desc') && (
                                <button
                                    onClick={() => {
                                        setSearchQuery('')
                                        setSortBy('date')
                                        setSortOrder('desc')
                                    }}
                                    style={{
                                        padding: '10px 16px',
                                        background: '#475569',
                                        border: 'none',
                                        borderRadius: 8,
                                        color: '#e2e8f0',
                                        fontSize: 14,
                                        cursor: 'pointer',
                                        fontWeight: 500
                                    }}
                                >
                                    Reset
                                </button>
                            )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginBottom: 16 }}>
                            <button className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`} onClick={() => setFilterStatus('all')}>All ({interviewHistory.length})</button>
                            <button className={`filter-btn ${filterStatus === 'completed' ? 'active' : ''}`} onClick={() => setFilterStatus('completed')}>Completed ({interviewHistory.filter(i => i.status === 'completed').length})</button>
                            <button className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`} onClick={() => setFilterStatus('pending')}>Pending ({interviewHistory.filter(i => i.status === 'pending').length})</button>
                            <button className={`filter-btn ${filterStatus === 'rejected' ? 'active' : ''}`} onClick={() => setFilterStatus('rejected')}>Not Selected ({interviewHistory.filter(i => i.status === 'rejected').length})</button>
                        </div>

                        <div className="table-wrapper-full">
                            <table className="history-table-full" role="table">
                                <thead>
                                    <tr>
                                        <th>Company</th>
                                        <th>Interviewer</th>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Interviewer Score</th>
                                        <th className="feedback-col">Feedback</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length === 0 && (
                                        <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center' }}>No interviews match the selected filter.</td></tr>
                                    )}

                                    {filtered.map((i) => {
                                        const interviewerScore = getInterviewerScore(i) ?? '—'
                                        const feedbackText = i.manualEvaluation?.comments ?? i.aiEvaluation?.summary ?? 'No feedback yet'
                                        const isExpanded = !!expandedRows[i.id]

                                        return (
                                            <tr
                                                key={i.id}
                                                className={`history-row-full ${selectedRow === i.id ? 'selected' : ''}`}
                                                onClick={() => setSelectedRow(i.id)}
                                                tabIndex={0}
                                            >
                                                <td data-label="Company">{i.companyName ?? '—'}</td>
                                                <td data-label="Interviewer">{i.interviewerName ?? '—'}</td>
                                                <td data-label="Date">{formatDate(i.scheduledAt ?? i.date)}</td>
                                                <td data-label="Time">{formatTime(i.scheduledAt ?? i.date)}</td>
                                                <td data-label="Interviewer Score">{typeof interviewerScore === 'number' ? interviewerScore : interviewerScore}</td>

                                                <td data-label="Feedback" className="feedback-col">
                                                    <div className="feedback-cell-full" style={{ alignItems: 'flex-start' }}>
                                                        <div className={`feedback-text-full ${isExpanded ? 'expanded' : 'collapsed'}`}>{feedbackText}</div>

                                                        {(i.manualEvaluation?.comments || i.aiEvaluation?.summary) && (
                                                            <button
                                                                className="feedback-toggle-full"
                                                                onClick={(e) => toggleExpandRow(i.id, e)}
                                                                aria-expanded={isExpanded}
                                                            >
                                                                {isExpanded ? 'Show less' : (feedbackText.length > 120 ? 'Show more' : 'View')}
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* small selected preview (optional) */}
                        <div style={{ marginTop: 18 }}>
                            {selectedRow ? (
                                (() => {
                                    const sel = interviewHistory.find((it) => it.id === selectedRow)
                                    if (!sel) return null
                                    return (
                                        <div style={{ padding: 12, borderRadius: 8, background: 'rgba(255,255,255,0.01)', color: 'rgba(255,255,255,0.9)' }}>
                                            <strong>Selected:</strong> {sel.jobDescription?.name ?? '—'} — {sel.interviewerName ?? '—'} • {formatDate(sel.scheduledAt ?? sel.date)} {formatTime(sel.scheduledAt ?? sel.date)}
                                        </div>
                                    )
                                })()
                            ) : (
                                <div style={{ color: 'rgba(255,255,255,0.7)' }}>Click a row to highlight it (selection only).</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default InterviewHistory
