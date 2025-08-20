'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MessageSquare, 
  Mail, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  Phone, 
  MapPin, 
  Star, 
  Eye, 
  Edit3, 
  Send, 
  BarChart3,
  Target,
  Zap,
  Sparkles,
  Rocket,
  Home,
  RefreshCw
} from 'lucide-react';
import { Lead } from '@/lib/types';
import Link from 'next/link';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('scraping');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const maxResults = 20; // Default value for scraping
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [dailyLimit, setDailyLimit] = useState(100);
  const [hourlyLimit, setHourlyLimit] = useState(10);
  const [emailSubject, setEmailSubject] = useState('Quick question about your business');
  const [currentPage, setCurrentPage] = useState(1);
  const [leadsPerPage] = useState(10);
  const [editingMessage, setEditingMessage] = useState<{ lead: Lead; message: string } | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const tabs = [
    { id: 'scraping', label: 'Lead Scraping', icon: <Search className="w-5 h-5" />, color: 'from-blue-500 to-cyan-500' },
    { id: 'messages', label: 'AI Messages', icon: <MessageSquare className="w-5 h-5" />, color: 'from-purple-500 to-pink-500' },
    { id: 'outreach', label: 'Email Outreach', icon: <Mail className="w-5 h-5" />, color: 'from-green-500 to-emerald-500' },
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-5 h-5" />, color: 'from-orange-500 to-red-500' }
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setCurrentPage(1); // Reset to first page when switching tabs
  };

  const stats = {
    totalLeads: leads.length,
    sourced: leads.filter(l => l.status === 'sourced').length,
    messageGenerated: leads.filter(l => l.status === 'message_generated').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    replied: leads.filter(l => l.status === 'replied').length,
    converted: leads.filter(l => l.status === 'converted').length
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/crm');
      if (response.ok) {
        const data = await response.json();
        setLeads(data.leads || []);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  };

  const handleScraping = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchQuery, maxResults })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          await fetchLeads();
          setActiveTab('messages');
        }
      }
    } catch (error) {
      console.error('Scraping error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMessages = async () => {
    if (selectedLeads.length === 0) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/generate-message', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          leadIds: selectedLeads, 
          promptTemplate: aiPrompt 
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          await fetchLeads();
          setActiveTab('outreach');
        }
      }
    } catch (error) {
      console.error('Message generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmails = async () => {
    if (selectedLeads.length === 0) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/send-email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          leadIds: selectedLeads, 
          subject: emailSubject 
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          await fetchLeads();
          setActiveTab('overview');
        }
      }
    } catch (error) {
      console.error('Email sending error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditMessage = async (lead: Lead) => {
    setEditingMessage({ lead, message: lead.message || '' });
    setIsEditModalOpen(true);
  };

  const handleSaveMessage = async () => {
    if (!editingMessage) return;
    
    try {
      const response = await fetch('/api/crm', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          leadId: editingMessage.lead.id,
          updates: { message: editingMessage.message }
        })
      });
      
      if (response.ok) {
        await fetchLeads(); // Refresh the leads list
        setIsEditModalOpen(false);
        setEditingMessage(null);
      }
    } catch (error) {
      console.error('Error updating message:', error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    setEditingMessage(null);
  };

  const toggleLeadSelection = (leadId: string) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const getStatusColor = (status: string) => {
    const colors = {
      sourced: 'bg-blue-100 text-blue-800 border-blue-200',
      message_generated: 'bg-purple-100 text-purple-800 border-purple-200',
      contacted: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      replied: 'bg-green-100 text-green-800 border-green-200',
      converted: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      deleted: 'bg-gray-100 text-gray-800 border-gray-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      bounced: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[status as keyof typeof colors] || colors.sourced;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      sourced: <Search className="w-4 h-4" />,
      message_generated: <MessageSquare className="w-4 h-4" />,
      contacted: <Mail className="w-4 h-4" />,
      replied: <CheckCircle className="w-4 h-4" />,
      converted: <Star className="w-4 h-4" />,
      deleted: <AlertCircle className="w-4 h-4" />,
      failed: <AlertCircle className="w-4 h-4" />,
      bounced: <AlertCircle className="w-4 h-4" />
    };
    return icons[status as keyof typeof icons] || icons.sourced;
  };

  // Pagination helpers
  const getCurrentLeads = (allLeads: Lead[]) => {
    const startIndex = (currentPage - 1) * leadsPerPage;
    const endIndex = startIndex + leadsPerPage;
    return allLeads.slice(startIndex, endIndex);
  };

  const getTotalPages = (allLeads: Lead[]) => {
    return Math.ceil(allLeads.length / leadsPerPage);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Pagination component
  const Pagination = ({ totalPages, currentPage, onPageChange }: { totalPages: number; currentPage: number; onPageChange: (page: number) => void }) => {
    if (totalPages <= 1) return null;
    
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return (
      <div className="flex items-center justify-center space-x-2 mt-6">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              1
            </button>
            {startPage > 2 && <span className="px-2 text-gray-500">...</span>}
          </>
        )}
        
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-2 text-sm font-medium rounded-lg border ${
              page === currentPage
                ? 'bg-blue-600 text-white border-blue-600'
                : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2 text-gray-500">...</span>}
            <button
              onClick={() => onPageChange(totalPages)}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {totalPages}
            </button>
          </>
        )}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 shadow-2xl">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30">
                <Rocket className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Verdanti AI
                </h1>
                <p className="text-blue-100 font-medium">AI-Powered Lead Generation</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="inline-flex items-center space-x-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-medium rounded-xl border border-white/30 hover:bg-white/30 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
              >
                <Home className="w-4 h-4" />
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalLeads}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sourced</p>
                <p className="text-2xl font-bold text-blue-600">{stats.sourced}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Search className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI Generated</p>
                <p className="text-2xl font-bold text-purple-600">{stats.messageGenerated}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Contacted</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.contacted}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Mail className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Replied</p>
                <p className="text-2xl font-bold text-green-600">{stats.replied}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Converted</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.converted}</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-xl">
                <Target className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg mb-8">
          <div className="flex space-x-1 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-lg transform scale-105`
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg p-8">
          {/* Scraping Tab */}
          {activeTab === 'scraping' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl mb-4">
                  <Search className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Lead Scraping</h2>
                <p className="text-gray-600">Discover and extract leads from Google Maps using AI-powered scraping</p>
              </div>
              
              <div className="max-w-2xl mx-auto">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search Query
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="e.g., landscapers in Austin TX"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-0 focus:ring-offset-0 transition-all duration-200 text-gray-900 placeholder-gray-500"
                        style={{ 
                          outline: 'none',
                          boxShadow: 'none'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <button
                  onClick={handleScraping}
                  disabled={loading || !searchQuery.trim()}
                  className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Zap className="w-5 h-5" />
                  )}
                  <span>{loading ? 'Scraping...' : 'Start Scraping'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-4">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Message Generation</h2>
                <p className="text-gray-600">Generate personalized outreach messages using AI</p>
              </div>
              
              <div className="w-full">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Available Sourced Leads</h3>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">
                        {selectedLeads.length} leads selected
                      </span>
                      <button
                        onClick={() => setSelectedLeads(leads.filter(l => l.status === 'sourced').map(l => l.id))}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Select All
                      </button>
                      <button
                        onClick={() => setSelectedLeads([])}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Clear Selection
                      </button>
                    </div>
                  </div>
                  
                  {leads.filter(lead => lead.status === 'sourced').length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">No sourced leads available</p>
                      <p className="text-sm">Please scrape some leads first to generate AI messages.</p>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-3 px-4 font-medium text-gray-700">
                                <input
                                  type="checkbox"
                                  checked={leads.filter(l => l.status === 'sourced').length > 0 && 
                                         selectedLeads.length === leads.filter(l => l.status === 'sourced').length}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedLeads(leads.filter(l => l.status === 'sourced').map(l => l.id));
                                    } else {
                                      setSelectedLeads([]);
                                    }
                                  }}
                                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                              </th>
                              <th className="text-left py-3 px-4 font-medium text-gray-700">Lead</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-700">Contact</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-700">Location</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {getCurrentLeads(leads.filter(lead => lead.status === 'sourced')).map((lead) => (
                              <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                                <td className="py-4 px-4">
                                  <input
                                    type="checkbox"
                                    checked={selectedLeads.includes(lead.id)}
                                    onChange={() => toggleLeadSelection(lead.id)}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                  />
                                </td>
                                <td className="py-4 px-4">
                                  <div>
                                    <h4 className="font-medium text-gray-900">{lead.name}</h4>
                                    {lead.categoryName && (
                                      <p className="text-sm text-gray-500">{lead.categoryName}</p>
                                    )}
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <div className="space-y-1">
                                    {lead.phone && (
                                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        <Phone className="w-4 h-4" />
                                        <span>{lead.phone}</span>
                                      </div>
                                    )}
                                    {lead.emails && lead.emails.length > 0 && (
                                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        <Mail className="w-4 h-4" />
                                        <span>{lead.emails[0]}</span>
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <MapPin className="w-4 h-4" />
                                    <span>{lead.city || 'N/A'}</span>
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(lead.status)}`}>
                                    {getStatusIcon(lead.status)}
                                    <span>{lead.status.replace('_', ' ')}</span>
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      <Pagination
                        totalPages={getTotalPages(leads.filter(lead => lead.status === 'sourced'))}
                        currentPage={currentPage}
                        onPageChange={handlePageChange}
                      />
                    </>
                  )}
                </div>
                
                <div className="text-center mt-8">
                  <button
                    onClick={handleGenerateMessages}
                    disabled={loading || selectedLeads.length === 0}
                    className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Sparkles className="w-5 h-5" />
                    )}
                    <span>{loading ? 'Generating...' : 'Generate Messages'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Outreach Tab */}
          {activeTab === 'outreach' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl mb-4">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Outreach</h2>
                <p className="text-gray-600">Send personalized emails to leads with AI-generated messages</p>
              </div>
              
              <div className="w-full">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Leads Ready for Outreach</h3>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">
                        {selectedLeads.length} leads selected
                      </span>
                      <button
                        onClick={() => setSelectedLeads(leads.filter(l => l.status === 'message_generated').map(l => l.id))}
                        className="text-sm text-green-600 hover:text-green-700 font-medium"
                      >
                        Select All
                      </button>
                      <button
                        onClick={() => setSelectedLeads([])}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Clear Selection
                      </button>
                    </div>
                  </div>
                  
                  {leads.filter(lead => lead.status === 'message_generated').length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">No leads ready for outreach</p>
                      <p className="text-sm">Please generate AI messages for leads first.</p>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-3 px-4 font-medium text-gray-700">
                                <input
                                  type="checkbox"
                                  checked={leads.filter(l => l.status === 'message_generated').length > 0 && 
                                         selectedLeads.length === leads.filter(l => l.status === 'message_generated').length}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedLeads(leads.filter(l => l.status === 'message_generated').map(l => l.id));
                                    } else {
                                      setSelectedLeads([]);
                                    }
                                  }}
                                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                                />
                              </th>
                              <th className="text-left py-3 px-4 font-medium text-gray-700">Lead</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-700">Contact</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-700">Location</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-700">Message Details</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {getCurrentLeads(leads.filter(lead => lead.status === 'message_generated')).map((lead) => (
                              <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                                <td className="py-4 px-4">
                                  <input
                                    type="checkbox"
                                    checked={selectedLeads.includes(lead.id)}
                                    onChange={() => toggleLeadSelection(lead.id)}
                                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                                  />
                                </td>
                                <td className="py-4 px-4">
                                  <div>
                                    <h4 className="font-medium text-gray-900">{lead.name}</h4>
                                    {lead.categoryName && (
                                      <p className="text-sm text-gray-500">{lead.categoryName}</p>
                                    )}
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <div className="space-y-1">
                                    {lead.phone && (
                                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        <Phone className="w-4 h-4" />
                                        <span>{lead.phone}</span>
                                      </div>
                                    )}
                                    {lead.emails && lead.emails.length > 0 && (
                                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        <Mail className="w-4 h-4" />
                                        <span>{lead.emails[0]}</span>
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <MapPin className="w-4 h-4" />
                                    <span>{lead.city || 'N/A'}</span>
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <div className="max-w-xs">
                                    {lead.message ? (
                                      <div className="space-y-2">
                                        <div className="text-sm text-gray-900 overflow-hidden" style={{ 
                                          display: '-webkit-box',
                                          WebkitLineClamp: 3,
                                          WebkitBoxOrient: 'vertical'
                                        }}>
                                          {lead.message}
                                        </div>
                                        <button
                                          onClick={() => handleEditMessage(lead)}
                                          className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium"
                                        >
                                          <Edit3 className="w-3 h-3" />
                                          <span>Edit Message</span>
                                        </button>
                                      </div>
                                    ) : (
                                      <span className="text-gray-400 text-sm">No message generated</span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(lead.status)}`}>
                                    {getStatusIcon(lead.status)}
                                    <span>{lead.status.replace('_', ' ')}</span>
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      <Pagination
                        totalPages={getTotalPages(leads.filter(lead => lead.status === 'message_generated'))}
                        currentPage={currentPage}
                        onPageChange={handlePageChange}
                      />
                    </>
                  )}
                </div>
                
                <div className="text-center mt-8">
                  <button
                    onClick={handleSendEmails}
                    disabled={loading || selectedLeads.length === 0}
                    className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                    <span>{loading ? 'Sending...' : 'Send Emails'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl mb-4">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics & Overview</h2>
                <p className="text-gray-600">Monitor your lead generation performance and manage your database</p>
              </div>
              
              <div className="w-full">
                <div className="w-full">
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Lead Database</h3>
                    </div>
                    
                    <div className="overflow-x-auto">
                                              <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-3 px-4 font-medium text-gray-700">Lead</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-700">Contact</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-700">Website</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-700">Location</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {getCurrentLeads(leads).map((lead) => (
                              <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                                <td className="py-4 px-4">
                                  <div>
                                    <h4 className="font-medium text-gray-900">{lead.name}</h4>
                                    {lead.categoryName && (
                                      <p className="text-sm text-gray-500">{lead.categoryName}</p>
                                    )}
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <div className="space-y-1">
                                    {lead.phone && (
                                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        <Phone className="w-4 h-4" />
                                        <span>{lead.phone}</span>
                                      </div>
                                    )}
                                    {lead.emails && lead.emails.length > 0 && (
                                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        <Mail className="w-4 h-4" />
                                        <span>{lead.emails[0]}</span>
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  {lead.website ? (
                                    <a 
                                      href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
                                    >
                                      {lead.domain}
                                    </a>
                                  ) : (
                                    <span className="text-gray-400 text-sm">No website</span>
                                  )}
                                </td>
                                <td className="py-4 px-4">
                                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <MapPin className="w-4 h-4" />
                                    <span>{lead.city || 'N/A'}</span>
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(lead.status)}`}>
                                    {getStatusIcon(lead.status)}
                                    <span>{lead.status.replace('_', ' ')}</span>
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                    </div>
                    
                    <Pagination
                      totalPages={getTotalPages(leads)}
                      currentPage={currentPage}
                      onPageChange={handlePageChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">Verdanti AI</span>
              </div>
              <p className="text-gray-400 mb-6">
                Transform your lead generation with AI-powered scraping, personalized messaging, and automated outreach.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.047-1.852-3.047-1.853 0-2.136 1.445-2.136 2.939v5.677H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6">Product</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6">Company</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6">Support</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Verdanti AI. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Edit Message Modal */}
      {isEditModalOpen && editingMessage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Edit Message</h3>
                <button
                  onClick={handleCancelEdit}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-blue-100 text-sm mt-1">
                Editing message for: <span className="font-medium">{editingMessage.lead.name}</span>
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message Content
                  </label>
                  <textarea
                    value={editingMessage.message}
                    onChange={(e) => setEditingMessage(prev => prev ? { ...prev, message: e.target.value } : null)}
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-0 transition-all duration-200 text-gray-900 resize-none"
                    placeholder="Enter your personalized message here..."
                  />
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MessageSquare className="w-4 h-4" />
                  <span>This message will be sent to {editingMessage.lead.emails && editingMessage.lead.emails.length > 0 ? editingMessage.lead.emails[0] : 'the lead'}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMessage}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
