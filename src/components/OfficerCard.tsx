import React from 'react';
import { Phone } from 'lucide-react';
import { motion } from 'motion/react';
import { Officer } from '../types';

interface OfficerCardProps {
  officer: Officer;
}

const OfficerCard: React.FC<OfficerCardProps> = ({ officer }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between transition-all hover:shadow-md"
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{officer.name}</h3>
        <p className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-4">
          {officer.designation}
        </p>
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
        <div className="flex flex-col">
          <span className="text-xs text-gray-400 uppercase font-bold tracking-tighter">Mobile Number</span>
          <span className="text-gray-700 font-mono font-medium">{officer.mobile}</span>
        </div>
        
        <a
          href={`tel:${officer.mobile}`}
          className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-600 hover:bg-pink-600 hover:text-white transition-colors"
          title="Call Officer"
        >
          <Phone size={18} />
        </a>
      </div>
    </motion.div>
  );
};

export default OfficerCard;
