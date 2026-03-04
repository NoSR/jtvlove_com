import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { Venue, CCA } from '../types';

const VenueDetail: React.FC = () => {
   const { id } = useParams();
   const navigate = useNavigate();

   const [venue, setVenue] = useState<Venue | null>(null);
   const [venueCCAs, setVenueCCAs] = useState<CCA[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [activeTab, setActiveTab] = useState<'info' | 'menu' | 'tables' | 'staff'>('info');
   const [showBookingModal, setShowBookingModal] = useState(false);
   const [bookingForm, setBookingForm] = useState({
      date: new Date().toISOString().split('T')[0],
      time: '19:00',
      customerName: '',
      customerContact: '',
      customerNote: '',
      groupSize: 1,
      selectedCCAs: [] as string[]
   });

   useEffect(() => {
      const fetchData = async () => {
         if (!id) return;
         setIsLoading(true);
         try {
            const [venueData, ccaData] = await Promise.all([
               apiService.getVenueById(id),
               apiService.getCCAs(id)
            ]);

            if (venueData) {
               // Map DB snake_case to frontend camelCase if necessary
               const mappedVenue = {
                  ...venueData,
                  reviewsCount: (venueData as any).reviews_count || 0,
                  operatingHours: (venueData as any).operating_hours || venueData.operatingHours || { open: '19:00', close: '02:00' },
               };
               setVenue(mappedVenue);
            }
            setVenueCCAs(ccaData || []);
         } catch (err) {
            console.error("Failed to load venue detail", err);
         } finally {
            setIsLoading(false);
         }
      };
      fetchData();
   }, [id]);

   const handleBookingSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!bookingForm.customerName || !bookingForm.customerContact) {
         alert("성함과 연락처를 입력해주세요.");
         return;
      }

      try {
         const success = await apiService.createReservation({
            venueId: id,
            customerName: bookingForm.customerName,
            customerContact: bookingForm.customerContact,
            customerNote: bookingForm.customerNote,
            date: bookingForm.date,
            time: bookingForm.time,
            groupSize: bookingForm.groupSize,
            ccaIds: bookingForm.selectedCCAs,
            status: 'pending'
         });

         if (success) {
            alert("예약 신청이 완료되었습니다. 관리자 확인 후 확정됩니다.");
            setShowBookingModal(false);
            setBookingForm({
               date: new Date().toISOString().split('T')[0],
               time: '19:00',
               customerName: '',
               customerContact: '',
               customerNote: '',
               groupSize: 1,
               selectedCCAs: []
            });
         } else {
            alert("예약에 실패했습니다. 다시 시도해주세요.");
         }
      } catch (err) {
         console.error(err);
         alert("오류가 발생했습니다.");
      }
   };

   const toggleCCASelection = (ccaId: string) => {
      setBookingForm(prev => ({
         ...prev,
         selectedCCAs: prev.selectedCCAs.includes(ccaId)
            ? prev.selectedCCAs.filter(id => id !== ccaId)
            : [...prev.selectedCCAs, ccaId]
      }));
   };

   if (isLoading) {
      return (
         <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <div className="size-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-black uppercase tracking-widest text-primary">Synchronizing Venue Archives...</p>
         </div>
      );
   }

   if (!venue) {
      return (
         <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <p className="text-xl font-bold">업소를 찾을 수 없습니다.</p>
            <button onClick={() => navigate(-1)} className="bg-primary text-black px-8 py-3 rounded-2xl font-black">돌아가기</button>
         </div>
      );
   }

   const tabs = [
      { id: 'info', label: '상세정보', icon: 'info' },
      { id: 'menu', label: '메뉴', icon: 'menu_book' },
      { id: 'tables', label: '룸/테이블', icon: 'meeting_room' },
      { id: 'staff', label: '소속 CCA', icon: 'groups' },
   ];

   const timeSlots = ['19:00', '20:00', '21:00', '22:00', '23:00', '00:00', '01:00', '02:00'];

   return (
      <div className="bg-background-light dark:bg-background-dark min-h-screen pb-32 animate-fade-in">
         {/* Hero Banner Section */}
         <div className="relative h-[300px] md:h-[450px] w-full bg-zinc-900 overflow-hidden">
            {venue.banner_image || venue.bannerImage ? (
               <img src={venue.banner_image || venue.bannerImage} alt="Banner" className="w-full h-full object-cover" />
            ) : (
               <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                  <span className="material-symbols-outlined text-6xl text-white/10">image</span>
               </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>

            {/* Back Button */}
            <button
               onClick={() => navigate(-1)}
               className="absolute top-6 left-6 size-10 md:size-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-all z-20"
            >
               <span className="material-symbols-outlined text-xl md:text-2xl">arrow_back</span>
            </button>

            {/* Logo Overlay */}
            <div className="absolute -bottom-12 left-6 md:left-12 flex items-end gap-6 z-10">
               <div className="size-24 md:size-32 rounded-3xl overflow-hidden border-4 border-white dark:border-zinc-900 bg-white shadow-2xl">
                  {venue.image ? (
                     <img src={venue.image} alt={venue.name} className="w-full h-full object-cover" />
                  ) : (
                     <div className="w-full h-full bg-zinc-100 flex items-center justify-center">
                        <span className="material-symbols-outlined text-zinc-300">store</span>
                     </div>
                  )}
               </div>
               <div className="pb-4 space-y-1">
                  <div className="flex items-center gap-2">
                     <span className="bg-primary text-black text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded">PREMIUM</span>
                     <div className="flex items-center text-primary font-bold">
                        <span className="material-symbols-outlined text-sm fill-1">star</span>
                        <span className="text-sm ml-0.5">{venue.rating || 0}</span>
                     </div>
                  </div>
                  <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight drop-shadow-lg">{venue.name}</h1>
                  <p className="flex items-center gap-1 text-white/80 text-xs md:text-sm font-bold">
                     <span className="material-symbols-outlined text-sm text-primary">location_on</span>
                     {venue.region}
                  </p>
               </div>
            </div>
         </div>

         <div className="max-w-4xl mx-auto w-full mt-20 md:mt-24 px-6 space-y-8">
            {/* Action Bar (Status & Contact Quick Info) */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-white dark:bg-zinc-900 rounded-[2rem] border border-primary/5 shadow-xl">
               <div className="flex items-center gap-4">
                  <span className="flex items-center gap-2 text-green-500 font-black uppercase text-xs">
                     <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                     </span>
                     Open Now
                  </span>
                  <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800"></div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                     {venue.operatingHours?.open} - {venue.operatingHours?.close}
                  </span>
               </div>
               <div className="flex gap-2">
                  {venue.sns?.telegram && (
                     <button className="size-10 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all">
                        <span className="material-symbols-outlined text-xl">send</span>
                     </button>
                  )}
                  {venue.phone && (
                     <button className="size-10 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center hover:bg-green-500 hover:text-white transition-all">
                        <span className="material-symbols-outlined text-xl">call</span>
                     </button>
                  )}
               </div>
            </div>

            {/* Custom Navigation Tabs */}
            <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 p-1.5 rounded-3xl border border-primary/5 shadow-inner">
               {tabs.map(tab => (
                  <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id as any)}
                     className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-primary text-black shadow-lg shadow-primary/20 scale-[1.02]' : 'text-gray-400 hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/5'}`}
                  >
                     <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                     <span className="hidden md:inline">{tab.label}</span>
                  </button>
               ))}
            </div>

            {/* Tab Contents */}
            <div className="min-h-[400px]">
               {activeTab === 'info' && (
                  <div className="space-y-10 animate-fade-in">
                     <div className="space-y-4">
                        <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                           <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                           About {venue.name}
                        </h3>
                        <p className="text-gray-600 dark:text-zinc-400 leading-relaxed font-medium whitespace-pre-wrap">
                           {venue.introduction || venue.description || '업소 소개 정보가 아직 등록되지 않았습니다.'}
                        </p>
                     </div>

                     {venue.media && Array.isArray(venue.media) && venue.media.length > 0 && (
                        <div className="space-y-4">
                           <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                              <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                              Venue Gallery
                           </h3>
                           <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {venue.media.map((url: string, idx: number) => (
                                 <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group">
                                    <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}

                     {venue.features && venue.features.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                           {venue.features.map((feat: string) => (
                              <div key={feat} className="flex flex-col items-center justify-center p-6 bg-white dark:bg-zinc-900 rounded-[2rem] border border-primary/5 shadow-sm hover:border-primary transition-all group">
                                 <span className="material-symbols-outlined text-primary mb-3 text-3xl group-hover:scale-110 transition-transform">
                                    {feat.includes('VIP') ? 'king_bed' : feat.includes('Live') ? 'mic_external_on' : feat.includes('Audio') ? 'surround_sound' : 'done'}
                                 </span>
                                 <span className="text-[10px] font-black uppercase tracking-widest text-center">{feat}</span>
                              </div>
                           ))}
                        </div>
                     )}

                     <div className="p-8 bg-zinc-900 text-white rounded-[2.5rem] space-y-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-10">
                           <span className="material-symbols-outlined text-8xl">location_on</span>
                        </div>
                        <h4 className="text-xs font-black uppercase tracking-[0.3em] text-primary">Location Archive</h4>
                        <div className="space-y-2 relative z-10">
                           <p className="text-2xl font-black">{venue.region}</p>
                           <p className="text-zinc-400 font-bold text-sm leading-tight">{venue.address || '상세 주소를 확인하려면 문의해주세요.'}</p>
                        </div>
                     </div>
                  </div>
               )}

               {activeTab === 'menu' && (
                  <div className="space-y-8 animate-fade-in">
                     <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black uppercase tracking-tight">Main Menu</h3>
                        <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Digital Board v1.0</span>
                     </div>
                     {venue.menu && Array.isArray(venue.menu) && venue.menu.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {venue.menu.map((item: any, idx: number) => (
                              <div key={idx} className="flex items-center justify-between p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-primary/5 hover:border-primary/20 transition-all">
                                 <div className="space-y-1">
                                    <p className="font-black dark:text-white uppercase">{item.name}</p>
                                    <p className="text-[10px] text-zinc-400 font-bold">{item.description || 'Premium Select'}</p>
                                 </div>
                                 <p className="text-primary font-black text-lg">{item.price ? typeof item.price === 'number' ? `₱${item.price.toLocaleString()}` : item.price : 'ASK'}</p>
                              </div>
                           ))}
                        </div>
                     ) : (
                        <div className="py-20 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[3rem]">
                           <span className="material-symbols-outlined text-4xl text-zinc-300 mb-2">restaurant_menu</span>
                           <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">메뉴 정보가 준비 중입니다.</p>
                        </div>
                     )}
                  </div>
               )}

               {activeTab === 'tables' && (
                  <div className="space-y-8 animate-fade-in">
                     <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black uppercase tracking-tight">Facilities & Rooms</h3>
                        <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Capacity Analysis</span>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Rooms */}
                        <div className="space-y-4">
                           <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">VIP Rooms</h4>
                           {venue.rooms && Array.isArray(venue.rooms) && venue.rooms.length > 0 ? (
                              <div className="space-y-2">
                                 {venue.rooms.map((room: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-black/20 rounded-xl border border-primary/5">
                                       <div className="flex items-center gap-3">
                                          <div className="size-10 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
                                             <span className="material-symbols-outlined text-xl">door_front</span>
                                          </div>
                                          <p className="font-bold text-sm">{room.name || room.number}</p>
                                       </div>
                                       <span className="text-[10px] font-black text-zinc-500">{room.capacity || '4'} Persons</span>
                                    </div>
                                 ))}
                              </div>
                           ) : (
                              <p className="text-xs text-zinc-400 ml-2">정보 없음</p>
                           )}
                        </div>
                        {/* Tables */}
                        <div className="space-y-4">
                           <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Hall Tables</h4>
                           {venue.tables && Array.isArray(venue.tables) && venue.tables.length > 0 ? (
                              <div className="space-y-2">
                                 {venue.tables.map((table: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-black/20 rounded-xl border border-primary/5">
                                       <div className="flex items-center gap-3">
                                          <div className="size-10 bg-zinc-200 dark:bg-white/10 rounded-lg flex items-center justify-center">
                                             <span className="material-symbols-outlined text-xl">table_bar</span>
                                          </div>
                                          <p className="font-bold text-sm">{table.name || table.number}</p>
                                       </div>
                                       <span className="text-[10px] font-black text-zinc-500">{table.capacity || '2-4'} Persons</span>
                                    </div>
                                 ))}
                              </div>
                           ) : (
                              <p className="text-xs text-zinc-400 ml-2">정보 없음</p>
                           )}
                        </div>
                     </div>
                  </div>
               )}

               {activeTab === 'staff' && (
                  <div className="space-y-8 animate-fade-in">
                     <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black uppercase tracking-tight">Active Staff Members</h3>
                        <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-full uppercase tracking-widest">
                           {venueCCAs.length} Verified
                        </span>
                     </div>
                     {venueCCAs.length > 0 ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                           {venueCCAs.map(cca => (
                              <Link to={`/ccas/${cca.id}`} key={cca.id} className="group space-y-4">
                                 <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-xl shadow-black/5 dark:shadow-none">
                                    <img src={cca.image} alt={cca.name} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                                    <div className="absolute bottom-4 left-4 right-4">
                                       <div className="flex items-center gap-1.5 bg-primary/20 backdrop-blur-md px-3 py-1.5 rounded-full w-fit">
                                          <span className="material-symbols-outlined text-primary text-xs fill-1">star</span>
                                          <span className="text-white text-[10px] font-black">{cca.rating}</span>
                                       </div>
                                    </div>
                                 </div>
                                 <div className="px-2">
                                    <h4 className="font-black text-lg group-hover:text-primary transition-colors">{cca.nickname || cca.name}</h4>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Japanese Speaker</p>
                                 </div>
                              </Link>
                           ))}
                        </div>
                     ) : (
                        <div className="py-20 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[3rem]">
                           <span className="material-symbols-outlined text-4xl text-zinc-300 mb-2">person_off</span>
                           <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">현재 출근 중인 스태프가 없습니다.</p>
                        </div>
                     )}
                  </div>
               )}
            </div>
         </div>

         {/* Sticky Bottom Actions */}
         <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-background-dark/80 backdrop-blur-xl border-t border-primary/10 px-6 py-4 z-40">
            <div className="max-w-4xl mx-auto flex gap-4">
               {venue.phone && (
                  <a href={`tel:${venue.phone}`} className="hidden md:flex flex-1 h-14 bg-white dark:bg-white/5 border-2 border-primary text-primary rounded-2xl font-black items-center justify-center gap-2 hover:bg-primary/10 active:scale-95 transition-all">
                     <span className="material-symbols-outlined">call</span>
                     전화 문의
                  </a>
               )}
               <button
                  onClick={() => setShowBookingModal(true)}
                  className="flex-[2] h-14 bg-primary text-[#1b180d] rounded-2xl font-black flex items-center justify-center gap-2 shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all"
               >
                  <span className="material-symbols-outlined">calendar_month</span>
                  실시간 예약하기
               </button>
               {venue.sns?.telegram && (
                  <button
                     onClick={() => window.open(venue.sns?.telegram || '#', '_blank')}
                     className="flex-1 h-14 bg-blue-500 text-white rounded-2xl font-black hidden md:flex items-center justify-center gap-2 shadow-2xl shadow-blue-500/30 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                     <span className="material-symbols-outlined">send</span>
                     텔레그램
                  </button>
               )}
            </div>
         </div>

         {/* Booking Modal */}
         {showBookingModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowBookingModal(false)}></div>
               <div className="relative w-full max-w-2xl bg-[#1b180d] rounded-[2.5rem] border border-primary/20 shadow-2xl overflow-hidden animate-slide-up">
                  <div className="p-8 border-b border-white/5 flex items-center justify-between">
                     <div>
                        <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Reservation</h2>
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-1">{venue.name}</p>
                     </div>
                     <button onClick={() => setShowBookingModal(false)} className="size-12 rounded-2xl bg-white/5 text-white flex items-center justify-center hover:bg-primary hover:text-[#1b180d] transition-all">
                        <span className="material-symbols-outlined">close</span>
                     </button>
                  </div>

                  <form onSubmit={handleBookingSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">날짜 선택</label>
                           <input
                              type="date"
                              value={bookingForm.date}
                              onChange={e => setBookingForm({ ...bookingForm, date: e.target.value })}
                              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-primary transition-all"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">시간 선택</label>
                           <select
                              value={bookingForm.time}
                              onChange={e => setBookingForm({ ...bookingForm, time: e.target.value })}
                              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-primary transition-all appearance-none"
                           >
                              {timeSlots.map(t => <option key={t} value={t} className="bg-[#1b180d]">{t}</option>)}
                           </select>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">성함 (닉네임)</label>
                           <input
                              type="text"
                              value={bookingForm.customerName}
                              onChange={e => setBookingForm({ ...bookingForm, customerName: e.target.value })}
                              placeholder="예: 홍길동"
                              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-primary transition-all"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">연락처 / SNS</label>
                           <input
                              type="text"
                              value={bookingForm.customerContact}
                              onChange={e => setBookingForm({ ...bookingForm, customerContact: e.target.value })}
                              placeholder="예: 0917... 또는 카톡 ID"
                              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-primary transition-all"
                           />
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">인원 수</label>
                        <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-2">
                           <button type="button" onClick={() => setBookingForm(prev => ({ ...prev, groupSize: Math.max(1, prev.groupSize - 1) }))} className="size-12 rounded-xl bg-white/5 text-white flex items-center justify-center hover:bg-primary/20 transition-all">-</button>
                           <span className="flex-1 text-center text-white font-black">{bookingForm.groupSize} 명</span>
                           <button type="button" onClick={() => setBookingForm(prev => ({ ...prev, groupSize: prev.groupSize + 1 }))} className="size-12 rounded-xl bg-white/5 text-white flex items-center justify-center hover:bg-primary/20 transition-all">+</button>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">희망 스태프 선택 (중복 가능)</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                           {venueCCAs.map(cca => {
                              const isSelected = bookingForm.selectedCCAs.includes(cca.id);
                              return (
                                 <div
                                    key={cca.id}
                                    onClick={() => toggleCCASelection(cca.id)}
                                    className={`relative aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${isSelected ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                 >
                                    <img src={cca.image} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                                    <div className="absolute bottom-2 left-2 right-2 text-center text-white text-[10px] font-black uppercase">{cca.nickname || cca.name}</div>
                                    {isSelected && <div className="absolute top-2 right-2 size-6 bg-primary rounded-full flex items-center justify-center text-black shadow-lg"><span className="material-symbols-outlined text-sm">check</span></div>}
                                 </div>
                              );
                           })}
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">추가 요청사항</label>
                        <textarea
                           value={bookingForm.customerNote}
                           onChange={e => setBookingForm({ ...bookingForm, customerNote: e.target.value })}
                           placeholder="주류 주문, 룸 선호 등 추가 사항을 적어주세요."
                           rows={3}
                           className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-primary transition-all resize-none"
                        />
                     </div>

                     <button type="submit" className="w-full py-6 bg-primary text-[#1b180d] rounded-2xl font-black uppercase tracking-[0.3em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all mt-4">
                        예약 신청하기
                     </button>
                  </form>
               </div>
            </div>
         )}
      </div>
   );
};

export default VenueDetail;