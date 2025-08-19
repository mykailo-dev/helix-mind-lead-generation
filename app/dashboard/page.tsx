'use client';

import { useState, useEffect } from 'react';
import { Users, Mail, MessageSquare, BarChart3, RefreshCw, Search, Send } from 'lucide-react';
import { Lead } from '@/lib/types';

type TabType = 'scraping' | 'messages' | 'sending' | 'overview';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('scraping');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiPromptTemplate, setAiPromptTemplate] = useState('');
  const [dailyEmailLimit, setDailyEmailLimit] = useState(50);
  const [campaignName, setCampaignName] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [editableMessages, setEditableMessages] = useState<Record<string, string>>({});
  const [stats, setStats] = useState({
    total: 0,
    sourced: 0,
    messageGenerated: 0,
    contacted: 0,
    replied: 0,
  });

  useEffect(() => {
    fetchLeads();
    fetchStats();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/crm?limit=100');
      const data = await response.json();
      if (data.success) {
        setLeads(data.leads);
        const messages: Record<string, string> = {};
        data.leads.forEach((lead: Lead) => {
          if (lead.message && lead.id) {
            messages[lead.id] = lead.message;
          }
        });
        setEditableMessages(messages);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/run-flow');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const runScraping = async () => {
    if (!searchQuery.trim()) {
      alert('Please enter a search query');
      return;
    }

    setIsScraping(true);
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchQuery,
          maxResults: 5,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`Scraping completed successfully!\nLeads found: ${result.totalFound}`);
        fetchLeads();
        fetchStats();
        setActiveTab('messages');
      } else {
        alert(`Scraping failed: ${result.error}`);
      }
    } catch (error) {
      alert('Error running scraping: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsScraping(false);
    }
  };

  const generateMessages = async () => {
    if (selectedLeads.size === 0) {
      alert('Please select at least one lead');
      return;
    }

    setIsGenerating(true);
    try {
      const selectedLeadIds = Array.from(selectedLeads);
      const selectedLeadData = leads.filter(lead => lead.id && selectedLeads.has(lead.id));

      const response = await fetch('/api/generate-message', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leads: selectedLeadData,
          promptTemplate: aiPromptTemplate || undefined,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`Messages generated successfully!\nMessages generated: ${result.messagesGenerated}`);
        fetchLeads();
        fetchStats();
        const newMessages: Record<string, string> = { ...editableMessages };
        result.leads.forEach((lead: Lead) => {
          if (lead.message && lead.id) {
            newMessages[lead.id] = lead.message;
          }
        });
        setEditableMessages(newMessages);
        setActiveTab('sending');
      } else {
        alert(`Message generation failed: ${result.error}`);
      }
    } catch (error) {
      alert('Error generating messages: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsGenerating(false);
    }
  };

  const sendEmails = async () => {
    if (selectedLeads.size === 0) {
      alert('Please select at least one lead');
      return;
    }

    setIsSending(true);
    try {
      const selectedLeadIds = Array.from(selectedLeads);
      const selectedLeadData = leads.filter(lead => lead.id && selectedLeads.has(lead.id));

      const response = await fetch('/api/send-email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
                     leads: selectedLeadData.map(lead => ({
             ...lead,
             message: (lead.id ? editableMessages[lead.id] : undefined) || lead.message || '',
           })),
          dailyEmailLimit,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`Emails sent successfully!\nEmails sent: ${result.emailsSent}`);
        fetchLeads();
        fetchStats();
        setSelectedLeads(new Set());
        setActiveTab('overview');
      } else {
        alert(`Email sending failed: ${result.error}`);
      }
    } catch (error) {
      alert('Error sending emails: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSending(false);
    }
  };

  const updateMessage = (leadId: string, message: string) => {
    setEditableMessages(prev => ({
      ...prev,
      [leadId]: message,
    }));
  };

  const toggleLeadSelection = (leadId: string) => {
    setSelectedLeads(prev => {
      const newSet = new Set(prev);
      if (newSet.has(leadId)) {
        newSet.delete(leadId);
      } else {
        newSet.add(leadId);
      }
      return newSet;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sourced': return 'bg-blue-100 text-blue-800';
      case 'message_generated': return 'bg-yellow-100 text-yellow-800';
      case 'contacted': return 'bg-purple-100 text-purple-800';
      case 'replied': return 'bg-green-100 text-green-800';
      case 'converted': return 'bg-emerald-100 text-emerald-800';
      case 'deleted': return 'bg-red-100 text-red-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'bounced': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'scraping', name: 'Scraping', icon: Search },
    { id: 'messages', name: 'Messages', icon: MessageSquare },
    { id: 'sending', name: 'Sending', icon: Send },
    { id: 'overview', name: 'Overview', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Lead Generation Dashboard</h1>
          <p className="text-gray-600">Manage your AI-powered lead generation campaigns</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <RefreshCw className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sourced</p>
                <p className="text-2xl font-bold text-gray-900">{stats.sourced}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Messages Generated</p>
                <p className="text-2xl font-bold text-gray-900">{stats.messageGenerated}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <Mail className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Contacted</p>
                <p className="text-2xl font-bold text-gray-900">{stats.contacted}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Replied</p>
                <p className="text-2xl font-bold text-gray-900">{stats.replied}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Scraping Tab */}
            {activeTab === 'scraping' && (
              <div>
                                 <h2 className="text-xl font-semibold mb-6">Scrape Leads from Google Maps (Apify)</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search Query
                    </label>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="e.g., plumbers in austin tx"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                    />
                  </div>
                </div>

                <button
                  onClick={runScraping}
                  disabled={isScraping}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isScraping ? (
                    <>
                      <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                      Scraping...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-5 w-5" />
                      Run Scraping
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Generate AI Messages</h2>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AI Prompt Template (Optional)
                  </label>
                  <textarea
                    value={aiPromptTemplate}
                    onChange={(e) => setAiPromptTemplate(e.target.value)}
                    placeholder="Custom AI prompt template..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                  />
                </div>

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Select Leads to Generate Messages</h3>
                    <button
                      onClick={generateMessages}
                      disabled={isGenerating || selectedLeads.size === 0}
                      className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Generate Messages
                        </>
                      )}
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <input
                              type="checkbox"
                              checked={selectedLeads.size === leads.filter(l => l.status === 'sourced').length}
                              onChange={(e) => {
                                const sourcedLeads = leads.filter(l => l.status === 'sourced');
                                if (e.target.checked) {
                                  setSelectedLeads(new Set(sourcedLeads.map(l => l.id)));
                                } else {
                                  setSelectedLeads(new Set());
                                }
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Business
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contact
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Message
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {leads.filter(lead => lead.status === 'sourced').map((lead) => (
                          <tr key={lead.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={selectedLeads.has(lead.id)}
                                onChange={() => toggleLeadSelection(lead.id)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                                {lead.website && (
                                  <div className="text-sm text-gray-500">
                                    <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                      {lead.domain}
                                    </a>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {lead.phone && <div>{lead.phone}</div>}
                                {lead.emails && lead.emails.length > 0 && <div className="text-gray-500">{lead.emails[0]}</div>}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                                {lead.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <textarea
                                value={editableMessages[lead.id] || ''}
                                onChange={(e) => updateMessage(lead.id, e.target.value)}
                                placeholder="AI-generated message will appear here..."
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 text-sm"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Sending Tab */}
            {activeTab === 'sending' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Send Emails</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Daily Email Limit
                    </label>
                    <input
                      type="number"
                      value={dailyEmailLimit}
                      onChange={(e) => setDailyEmailLimit(parseInt(e.target.value) || 50)}
                      min="1"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Select Leads to Send Emails</h3>
                    <button
                      onClick={sendEmails}
                      disabled={isSending || selectedLeads.size === 0}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSending ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Emails
                        </>
                      )}
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <input
                              type="checkbox"
                              checked={selectedLeads.size === leads.filter(l => l.status === 'message_generated').length}
                              onChange={(e) => {
                                const messageGeneratedLeads = leads.filter(l => l.status === 'message_generated');
                                if (e.target.checked) {
                                  setSelectedLeads(new Set(messageGeneratedLeads.map(l => l.id)));
                                } else {
                                  setSelectedLeads(new Set());
                                }
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Business
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contact
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Message
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {leads.filter(lead => lead.status === 'message_generated').map((lead) => (
                          <tr key={lead.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={selectedLeads.has(lead.id)}
                                onChange={() => toggleLeadSelection(lead.id)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                                {lead.website && (
                                  <div className="text-sm text-gray-500">
                                    <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                      {lead.domain}
                                    </a>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {lead.phone && <div>{lead.phone}</div>}
                                {lead.emails && lead.emails.length > 0 && <div className="text-gray-500">{lead.emails[0]}</div>}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                                {lead.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <textarea
                                value={editableMessages[lead.id] || lead.message || ''}
                                onChange={(e) => updateMessage(lead.id, e.target.value)}
                                placeholder="Edit message before sending..."
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 text-sm"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Recent Leads Overview</h2>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Business
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {leads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                              {lead.website && (
                                <div className="text-sm text-gray-500">
                                  <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                    {lead.domain}
                                  </a>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {lead.phone && <div>{lead.phone}</div>}
                              {lead.emails && lead.emails.length > 0 && <div className="text-gray-500">{lead.emails[0]}</div>}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {lead.city && <div>{lead.city}</div>}
                              {lead.state && <div className="text-gray-500">{lead.state}</div>}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                              {lead.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(lead.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
