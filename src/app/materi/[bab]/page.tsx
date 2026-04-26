/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import MateriPramuka from '@/models/MateriPramuka';
import { ArrowLeft, BookOpen, CheckCircle, Youtube } from 'lucide-react';

// Extract YouTube ID from URL helper
function getYoutubeId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default async function BabPage({ params }: { params: { bab: string } }) {
  const babNumber = parseInt(params.bab);
  
  await dbConnect();
  const materi = await MateriPramuka.findOne({ bab: babNumber }).lean();

  if (!materi) {
    notFound();
  }

  const youtubeId = materi.youtubeUrl ? getYoutubeId(materi.youtubeUrl) : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/materi" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-2">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali ke Daftar Materi
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {youtubeId ? (
          <div className="aspect-video w-full bg-gray-900">
            <iframe 
              width="100%" 
              height="100%" 
              src={`https://www.youtube.com/embed/${youtubeId}`} 
              title="YouTube video player" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        ) : materi.imageUrl ? (
          <div className="h-64 w-full bg-gray-100 flex items-center justify-center p-4 border-b">
            <img src={materi.imageUrl} alt={materi.title} className="max-h-full object-contain mix-blend-multiply" />
          </div>
        ) : null}
        
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
          href={`/materi/${materi.bab}/quiz`} 
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
        >
          Mulai Kuis BAB {materi.bab}
        </Link>
      </div>
    </div>
  );
}
