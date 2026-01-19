import React from 'react';

class ReportCard {
  constructor({ id, title, description, icon: Icon, color, category, reportCount, onClick }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.Icon = Icon;
    this.color = color;
    this.category = category;
    this.reportCount = reportCount;
    this.onClick = onClick;
  }

  render() {
    const { id, title, description, Icon, color, category, reportCount, onClick } = this;
    const colorClasses = this.getColorClasses(color);

    return (
      <div
        onClick={() => onClick && onClick(id)}
        className={`${colorClasses.card} cursor-pointer transition-all duration-300 hover:shadow-2xl rounded-2xl p-6 relative border-2 border-gray-200/50 hover:-translate-y-1`}
        style={{
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}
      >
        <div className="absolute top-4 right-4">
          <span className="bg-gradient-to-r from-white to-gray-50 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-md border border-gray-200" style={{ fontFamily: 'Inter, sans-serif' }}>
            {reportCount || 0} reports
          </span>
        </div>
        
        <div className="flex flex-col space-y-4">
          <div className="flex items-start space-x-4">
            <div className={`${colorClasses.iconBg} p-3 rounded-xl flex-shrink-0 w-14 h-14 flex items-center justify-center shadow-lg`} style={{
              background: colorClasses.iconBg.includes('blue') ? 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' :
                          colorClasses.iconBg.includes('green') ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
                          colorClasses.iconBg.includes('purple') ? 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)' :
                          colorClasses.iconBg.includes('orange') ? 'linear-gradient(135deg, #f97316 0%, #f59e0b 100%)' :
                          colorClasses.iconBg.includes('red') ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' :
                          colorClasses.iconBg.includes('indigo') ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' :
                          colorClasses.iconBg.includes('teal') ? 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)' :
                          colorClasses.iconBg.includes('pink') ? 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)' :
                          'linear-gradient(135deg, #eab308 0%, #f59e0b 100%)'
            }}>
              {Icon && <Icon className="text-white w-7 h-7" />}
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <div className="mb-2">
                <span className={`${colorClasses.categoryTag} text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm`} style={{ fontFamily: 'Inter, sans-serif' }}>
                  {category}
                </span>
              </div>
              <h3 className={`${colorClasses.title} text-xl font-bold mb-2 leading-tight`} style={{ fontFamily: 'Poppins, sans-serif' }}>
                {title}
              </h3>
            </div>
          </div>
          <p className={`${colorClasses.description} text-sm leading-relaxed font-medium`} style={{ fontFamily: 'Inter, sans-serif' }}>
            {description}
          </p>
        </div>
      </div>
    );
  }

  getColorClasses(color) {
    const colorMap = {
      blue: {
        card: 'bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100',
        iconBg: 'bg-blue-500',
        icon: 'text-white',
        title: 'text-gray-900',
        description: 'text-gray-700',
        categoryTag: 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border border-blue-200'
      },
      green: {
        card: 'bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100',
        iconBg: 'bg-green-500',
        icon: 'text-white',
        title: 'text-gray-900',
        description: 'text-gray-700',
        categoryTag: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200'
      },
      purple: {
        card: 'bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100',
        iconBg: 'bg-purple-500',
        icon: 'text-white',
        title: 'text-gray-900',
        description: 'text-gray-700',
        categoryTag: 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-200'
      },
      orange: {
        card: 'bg-gradient-to-br from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100',
        iconBg: 'bg-orange-500',
        icon: 'text-white',
        title: 'text-gray-900',
        description: 'text-gray-700',
        categoryTag: 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 border border-orange-200'
      },
      red: {
        card: 'bg-gradient-to-br from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100',
        iconBg: 'bg-red-500',
        icon: 'text-white',
        title: 'text-gray-900',
        description: 'text-gray-700',
        categoryTag: 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border border-red-200'
      },
      indigo: {
        card: 'bg-gradient-to-br from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100',
        iconBg: 'bg-indigo-500',
        icon: 'text-white',
        title: 'text-gray-900',
        description: 'text-gray-700',
        categoryTag: 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border border-indigo-200'
      },
      teal: {
        card: 'bg-gradient-to-br from-teal-50 to-cyan-50 hover:from-teal-100 hover:to-cyan-100',
        iconBg: 'bg-teal-500',
        icon: 'text-white',
        title: 'text-gray-900',
        description: 'text-gray-700',
        categoryTag: 'bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-700 border border-teal-200'
      },
      pink: {
        card: 'bg-gradient-to-br from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100',
        iconBg: 'bg-pink-500',
        icon: 'text-white',
        title: 'text-gray-900',
        description: 'text-gray-700',
        categoryTag: 'bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 border border-pink-200'
      },
      yellow: {
        card: 'bg-gradient-to-br from-yellow-50 to-amber-50 hover:from-yellow-100 hover:to-amber-100',
        iconBg: 'bg-yellow-500',
        icon: 'text-white',
        title: 'text-gray-900',
        description: 'text-gray-700',
        categoryTag: 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border border-yellow-200'
      }
    };

    return colorMap[color] || colorMap.blue;
  }
}

const ReportCardComponent = ({ id, title, description, icon: Icon, color, category, reportCount, onClick }) => {
  const card = new ReportCard({ id, title, description, icon: Icon, color, category, reportCount, onClick });
  return card.render();
};

export default ReportCardComponent;

