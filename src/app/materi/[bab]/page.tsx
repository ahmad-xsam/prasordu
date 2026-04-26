import Link from 'next/link';
import { notFound } from 'next/navigation';
import { materiPramuka } from '@/data/materiPramuka';
import { ArrowLeft, BookOpen, CheckCircle } from 'lucide-react';

export default function BabPage({ params }: { params: { bab: string } }) {
  const babNumber = parseInt(params.bab);
  const materi = materiPramuka.find(m => m.bab === babNumber);

  if (!materi) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/materi" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-2">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali ke Daftar Materi
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {materi.imageUrl && (
          <div className="h-64 w-full bg-gray-100 flex items-center justify-center p-4 border-b">
            {/* If it's a real image, we would use next/image. For now standard img tag to support external SVG/placeholder */}
            <img src={materi.imageUrl} alt={materi.title} className="max-h-full object-contain mix-blend-multiply" />
          </div>
        )}
        
        <div className="p-8">
          <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-bold mb-4">
            <BookOpen size={16} /> BAB {materi.bab}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-6">{materi.title}</h1>
          
          <div 
            className="prose prose-blue max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: materi.content }}
          />
        </div>
      </div>

      <div className="bg-primary-50 rounded-xl border border-primary-200 p-8 text-center flex flex-col items-center">
        <CheckCircle className="text-primary-500 h-12 w-12 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Selesai membaca?</h2>
        <p className="text-gray-600 mb-6 max-w-md">Uji pemahaman Anda melalui kuis singkat ini. Dapatkan 5 bintang untuk membuka BAB selanjutnya!</p>
        
        <Link 
          href={\`/materi/\${materi.bab}/quiz\`} 
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
        >
          Mulai Kuis BAB {materi.bab}
        </Link>
      </div>
    </div>
  );
}
