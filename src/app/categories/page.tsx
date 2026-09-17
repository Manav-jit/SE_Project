import Link from 'next/link';
import { ArrowLeft, ArrowRight, Sprout, Heart, Home, GraduationCap, Users, Briefcase } from 'lucide-react';

const categories = [
  {
    slug: 'agriculture',
    name: 'Agriculture',
    description: 'Income support, crop insurance, and farming subsidies for farmers.',
    icon: Sprout,
    color: '#22c55e',
    count: 1,
  },
  {
    slug: 'healthcare',
    name: 'Healthcare',
    description: 'Health insurance, free treatment, and medical aid for families.',
    icon: Heart,
    color: '#ef4444',
    count: 1,
  },
  {
    slug: 'housing',
    name: 'Housing',
    description: 'Affordable housing, home loan subsidies, and shelter schemes.',
    icon: Home,
    color: '#f59e0b',
    count: 1,
  },
  {
    slug: 'education',
    name: 'Education',
    description: 'Scholarships, skill development, and free education for students.',
    icon: GraduationCap,
    color: '#3b82f6',
    count: 0,
  },
  {
    slug: 'women-and-child',
    name: 'Women & Child',
    description: 'Maternity benefits, nutrition programs, and women empowerment.',
    icon: Users,
    color: '#ec4899',
    count: 0,
  },
  {
    slug: 'employment',
    name: 'Employment',
    description: 'Job guarantees, skill training, and startup incentives.',
    icon: Briefcase,
    color: '#8b5cf6',
    count: 0,
  },
];

export default function CategoriesPage() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-[-15%] left-[-5%] w-[30%] h-[30%] rounded-full bg-[#f59e0b]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-5%] w-[30%] h-[30%] rounded-full bg-[#22c55e]/10 blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 py-8 md:py-12 relative z-10">
        {/* Header */}
        <div className="mb-10 animate-fade-in">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-bold mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-4xl sm:text-5xl font-black font-serif">Browse by Category</h1>
          <p className="text-muted-foreground font-bold mt-2 max-w-xl">
            Explore government welfare schemes organized by sector. Click a category to see all available schemes.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children" role="list" aria-label="Scheme categories">
          {categories.map(cat => {
            const Icon = cat.icon;
            const hasSchemes = cat.count > 0;
            
            const cardContent = (
              <>
                <div className="flex items-center justify-between">
                  <div 
                    className="w-12 h-12 rounded-xl border-2 border-foreground flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-[2px_2px_0px_0px_var(--foreground)]"
                    style={{ backgroundColor: cat.color }}
                  >
                    <Icon className="w-6 h-6 text-foreground" />
                  </div>
                  {hasSchemes ? (
                    <span 
                      className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border-2 border-foreground shadow-[2px_2px_0px_0px_var(--foreground)]"
                      style={{ backgroundColor: cat.color, color: 'var(--foreground)' }}
                    >
                      {cat.count} {cat.count === 1 ? 'scheme' : 'schemes'}
                    </span>
                  ) : (
                    <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border-2 border-foreground bg-card-border shadow-[2px_2px_0px_0px_var(--foreground)] text-muted-foreground">Coming soon</span>
                  )}
                </div>
                
                <div>
                  <h2 className="text-xl font-black text-foreground">{cat.name}</h2>
                  <p className="text-sm font-medium text-foreground/80 mt-1 leading-relaxed">{cat.description}</p>
                </div>

                {hasSchemes && (
                  <div className="mt-auto pt-2 flex items-center gap-1.5 text-sm font-black transition-all group-hover:gap-2.5 text-foreground">
                    View Schemes <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </>
            );

            if (hasSchemes) {
              return (
                <Link
                  key={cat.slug}
                  href={`/categories/${cat.slug}`}
                  className="group organic-card p-6 flex flex-col gap-4 transition-all no-underline cursor-pointer hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_0px_var(--foreground)]"
                  role="listitem"
                >
                  {cardContent}
                </Link>
              );
            }

            return (
              <div
                key={cat.slug}
                className="group organic-card p-6 flex flex-col gap-4 transition-all no-underline opacity-50 cursor-default bg-[#F9FFF4]"
                role="listitem"
              >
                {cardContent}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
