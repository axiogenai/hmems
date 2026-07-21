import glob
import re

files = glob.glob('src/app/*/page.tsx')

new_header = """const PageHeader = ({ title, breadcrumb }: { title: string; breadcrumb: string }) => (
  <section className="bg-primary py-4 md:py-5 relative overflow-hidden border-t border-white/5">
    <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
    <div className="container-custom relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl md:text-3xl font-bold text-white">{title}</h1>
        <div className="hidden md:block w-8 h-1 bg-accent rounded-full" />
      </div>
      <nav className="flex items-center gap-2 text-white/50 text-xs font-medium">
        <Link href="/" className="hover:text-white transition-colors flex items-center gap-1"><Home size={12} /> Home</Link>
        <ChevronRight size={12} />
        <span className="text-white/80">{breadcrumb}</span>
      </nav>
    </div>
  </section>
);"""

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We will use regex to find the PageHeader declaration block
    # It starts with "const PageHeader = " and ends with ");"
    # We will replace it.
    
    # Since student-life has a slightly different signature: const PageHeader = ({ title, breadcrumb, subtitle }...
    # We can match all of them:
    pattern = r'const PageHeader = \([^\)]+\) => \([\s\S]*?\n\);'
    
    # Before replacing, let's check if it matches
    if re.search(pattern, content):
        content = re.sub(pattern, new_header, content)
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file}")
    else:
        print(f"PageHeader not found or pattern mismatch in {file}")
