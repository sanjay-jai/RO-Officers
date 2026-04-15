/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { Search, Users, Phone, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import OfficerCard from './components/OfficerCard';
import LoadingSpinner from './components/LoadingSpinner';
import { Officer } from './types';

// Default CSV URL from user's provided sheet
const DEFAULT_CSV_URL = 'https://docs.google.com/spreadsheets/d/1lxDgCO79EcgVbKw_eQFMUoj5Ph_PvdG8/export?format=csv&gid=1425878517';

export default function App() {
  const [csvUrl, setCsvUrl] = useState<string>(() => {
    return localStorage.getItem('fst_csv_url') || DEFAULT_CSV_URL;
  });
  const [data, setData] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedConstituency, setSelectedConstituency] = useState<string>('');
  const [searchTriggered, setSearchTriggered] = useState(false);

  // Fetch data from Google Sheets CSV
  const fetchData = async (url: string) => {
    if (!url) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch data. Please check your CSV link.');
      const csvText = await response.text();
      
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const parsedData: Officer[] = results.data.map((row: any) => {
            // Mapping based on provided column names
            const constituency = row['Assembly Constituency'] || '';
            const nameAndDesignation = row["Name of Member in RO's office & Designation"] || '';
            const mobile = row['Mobile No'] || '';
            
            // Try to split name and designation if possible (e.g., "John Doe (Officer)")
            let name = nameAndDesignation;
            let designation = 'Officer';
            
            if (nameAndDesignation.includes('(')) {
              const parts = nameAndDesignation.split('(');
              name = parts[0].trim();
              designation = parts[1].replace(')', '').trim();
            } else if (nameAndDesignation.includes('-')) {
              const parts = nameAndDesignation.split('-');
              name = parts[0].trim();
              designation = parts[1].trim();
            }

            return { constituency, name, designation, mobile };
          });
          
          setData(parsedData);
          setLoading(false);
          localStorage.setItem('fst_csv_url', url);
        },
        error: (err: any) => {
          setError('Error parsing CSV data: ' + err.message);
          setLoading(false);
        }
      });
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (csvUrl) {
      fetchData(csvUrl);
    }
  }, []);

  const constituencies = useMemo(() => {
    if (data.length === 0) return [];
    const unique = Array.from(new Set(data.map(item => item.constituency))).filter(Boolean);
    return unique.sort();
  }, [data]);

  const filteredOfficers = useMemo(() => {
    if (!searchTriggered || !selectedConstituency) return [];
    if (selectedConstituency === 'ALL') return data;
    return data.filter(item => item.constituency === selectedConstituency);
  }, [data, selectedConstituency, searchTriggered]);

  const handleSearch = () => {
    setSearchTriggered(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Header Section */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-500 text-white py-12 px-4 shadow-lg">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2"
          >
            Assembly Constituency
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl font-medium text-purple-100"
          >
            RO Office
          </motion.p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 -mt-8 pb-20">
        {/* Search Box */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-xl p-6 md:p-8 mb-12 border border-gray-100"
        >
          <div className="flex flex-col gap-6">
            <div className="w-full">
              <label htmlFor="constituency" className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                Select Constituency
              </label>
              <div className="relative">
                <select
                  id="constituency"
                  value={selectedConstituency}
                  onChange={(e) => {
                    setSelectedConstituency(e.target.value);
                    setSearchTriggered(false);
                  }}
                  disabled={loading || data.length === 0}
                  className="w-full h-12 pl-4 pr-10 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all cursor-pointer outline-none disabled:opacity-50"
                >
                  {loading ? (
                    <option>Loading data...</option>
                  ) : data.length === 0 ? (
                    <option>No data found in sheet</option>
                  ) : (
                    <>
                      <option value="">-- Choose a Constituency --</option>
                      <option value="ALL">All constituency</option>
                      {constituencies.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </>
                  )}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <Search size={18} />
                </div>
              </div>
            </div>
            
            <button
              onClick={handleSearch}
              disabled={!selectedConstituency || loading || data.length === 0}
              className="w-full h-12 px-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg shadow-purple-200 hover:shadow-purple-300 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Search size={18} />
              Search Now
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3">
              <AlertCircle size={20} />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
        </motion.div>

        {/* Results Section */}
        <div className="space-y-8">
          {loading ? (
            <LoadingSpinner />
          ) : searchTriggered ? (
            <>
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Users className="text-purple-600" size={24} />
                  Officers in {selectedConstituency === 'ALL' ? 'All Constituencies' : selectedConstituency}
                </h2>
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-bold">
                  {filteredOfficers.length} Total
                </span>
              </div>

              {filteredOfficers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence mode="popLayout">
                    {filteredOfficers.map((officer, idx) => (
                      <OfficerCard key={`${officer.name}-${idx}`} officer={officer} />
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200"
                >
                  <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="text-gray-400" size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-700">No results found</h3>
                  <p className="text-gray-500">No officers found for the selected constituency.</p>
                </motion.div>
              )}
            </>
          ) : (
            <div className="text-center py-12 opacity-50">
              <p className="text-gray-400 font-medium italic">Select a constituency and click search to view officers</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-400 text-sm">
        <p>© {new Date().getFullYear()} RO Office Officer Search Tool</p>
      </footer>
    </div>
  );
}
