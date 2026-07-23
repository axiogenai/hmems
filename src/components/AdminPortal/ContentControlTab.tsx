import React, { useState } from "react";
import { Settings, RotateCcw, Image, FileText, Calendar, Plus, Trash2, Edit2, Sparkles, X, Check, Eye } from "lucide-react";
import { ConfigVersion } from "@/types/admin";
import { FormInput } from "@/components/TeacherPortal/FormInput";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { blogPosts as defaultBlogs, events as defaultEvents, galleryImages as defaultGallery } from "@/data/site-data";

function ImageUploader({
  value,
  onChange,
  label = "Cover Image (URL or Upload File)"
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("File size exceeds 5MB limit.");
      return;
    }

    setUploading(true);
    setErrorMsg("");

    try {
      const { supabase } = await import("@/lib/supabase");
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `uploads/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

      const { error } = await supabase.storage.from("school-media").upload(path, file, {
        cacheControl: "3600",
        upsert: true
      });

      if (error) {
        console.warn("Supabase storage upload fallback:", error.message);
        const reader = new FileReader();
        reader.onloadend = () => {
          onChange(reader.result as string);
          setUploading(false);
        };
        reader.readAsDataURL(file);
      } else {
        const { data: pubData } = supabase.storage.from("school-media").getPublicUrl(path);
        onChange(pubData.publicUrl);
        setUploading(false);
      }
    } catch (err: any) {
      console.error("Upload error fallback:", err);
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">{label}</label>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste URL or upload image file below..."
          className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs focus:bg-white focus:outline-none"
        />
        <label className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-colors">
          {uploading ? <div className="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" /> : <Image size={14} />}
          <span>{uploading ? "Uploading..." : "Upload File"}</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
        </label>
      </div>
      {errorMsg && <p className="text-[11px] text-rose-500 font-semibold">{errorMsg}</p>}
      {value && (
        <div className="relative w-full h-24 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 mt-2">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 p-1 bg-rose-600 text-white rounded-md text-[10px] font-bold shadow-md hover:bg-rose-700 cursor-pointer"
          >
            Remove Image
          </button>
        </div>
      )}
    </div>
  );
}

interface ContentControlTabProps {
  editableConfig: {
    schoolName: string;
    tagline: string;
    foundedYear: number;
    phone: string;
    email: string;
    principalName?: string;
    principalRole?: string;
    principalMessage?: string;
    principalPhoto?: string;
  };
  configVersions: ConfigVersion[];
  onSaveConfig: (config: any) => void;
  onRollbackConfig: (versionId: string) => void;
  formErrors: Record<string, string>;
  configSuccess: boolean;
}

export function ContentControlTab({
  editableConfig,
  configVersions,
  onSaveConfig,
  onRollbackConfig,
  formErrors,
  configSuccess,
}: ContentControlTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<"metadata" | "blogs" | "cultural" | "events">("metadata");
  const [config, setConfig] = useState(editableConfig);

  // Persistent CMS Stores synced to local storage & default data
  const [blogList, setBlogList] = useLocalStorage("cms_blog_posts", defaultBlogs);
  const [galleryList, setGalleryList] = useLocalStorage("cms_cultural_gallery", defaultGallery);
  const [eventList, setEventList] = useLocalStorage("cms_school_events", defaultEvents);

  // Homepage Hero Background Image State
  const [heroBgUrl, setHeroBgUrl] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("hmems_hero_bg_image") || "/images/school-campus-hero.jpg";
    }
    return "/images/school-campus-hero.jpg";
  });

  const handleUpdateHeroBg = (newUrl: string) => {
    setHeroBgUrl(newUrl);
    if (typeof window !== "undefined") {
      localStorage.setItem("hmems_hero_bg_image", newUrl);
      window.dispatchEvent(new Event("hero_bg_updated"));
    }
    showSuccess("Homepage Hero Background image updated live!");
  };

  const handleResetHeroBg = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("hmems_hero_bg_image");
      window.dispatchEvent(new Event("hero_bg_updated"));
    }
    setHeroBgUrl("/images/school-campus-hero.jpg");
    showSuccess("Hero background reset to default campus photo.");
  };

  // Blog Modal state
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any | null>(null);
  const [blogTitle, setBlogTitle] = useState("");
  const [blogCategory, setBlogCategory] = useState("Achievements");
  const [blogAuthor, setBlogAuthor] = useState("Principal");
  const [blogExcerpt, setBlogExcerpt] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [blogImage, setBlogImage] = useState("");

  // Gallery Modal state
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [galleryTitle, setGalleryTitle] = useState("");
  const [galleryCategory, setGalleryCategory] = useState("Cultural Events");
  const [galleryUrl, setGalleryUrl] = useState("");
  const [galleryDesc, setGalleryDesc] = useState("");

  // Event Modal state
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventCategory, setEventCategory] = useState("Cultural");
  const [eventDesc, setEventDesc] = useState("");
  const [eventImage, setEventImage] = useState("");

  const [actionSuccessMsg, setActionSuccessMsg] = useState("");

  const showSuccess = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(""), 3500);
  };

  const handleMetadataSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(config);
  };

  React.useEffect(() => {
    setConfig(editableConfig);
  }, [editableConfig]);

  // ── Blog Handlers ──
  const handleOpenBlogModal = (blog?: any) => {
    if (blog) {
      setEditingBlog(blog);
      setBlogTitle(blog.title);
      setBlogCategory(blog.category || "Achievements");
      setBlogAuthor(blog.author || "Admin");
      setBlogExcerpt(blog.excerpt || "");
      setBlogContent(blog.content || "");
      setBlogImage(blog.image || "");
    } else {
      setEditingBlog(null);
      setBlogTitle("");
      setBlogCategory("Achievements");
      setBlogAuthor("Principal");
      setBlogExcerpt("");
      setBlogContent("");
      setBlogImage("");
    }
    setShowBlogModal(true);
  };

  const handleSaveBlog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogTitle.trim()) return;

    if (editingBlog) {
      setBlogList(prev => prev.map(b => b.id === editingBlog.id ? {
        ...b,
        title: blogTitle,
        category: blogCategory,
        author: blogAuthor,
        excerpt: blogExcerpt,
        content: blogContent,
        image: blogImage || "/images/blog/default.jpg"
      } : b));
      showSuccess("Blog article updated successfully.");
    } else {
      const newBlog = {
        id: Date.now(),
        slug: blogTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        title: blogTitle,
        excerpt: blogExcerpt || blogTitle,
        date: new Date().toISOString().slice(0, 10),
        author: blogAuthor,
        category: blogCategory,
        image: blogImage || "/images/blog/default.jpg",
        content: blogContent || blogExcerpt
      };
      setBlogList(prev => [newBlog, ...prev]);
      showSuccess("New blog post published live on website.");
    }
    setShowBlogModal(false);
  };

  const handleDeleteBlog = (id: number) => {
    if (confirm("Are you sure you want to delete this blog post?")) {
      setBlogList(prev => prev.filter(b => b.id !== id));
      showSuccess("Blog post deleted.");
    }
  };

  // ── Gallery Handlers ──
  const handleSaveGallery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryTitle.trim()) return;

    const newItem = {
      id: Date.now(),
      src: galleryUrl || "/images/gallery/cultural.jpg",
      alt: galleryTitle,
      category: galleryCategory,
      title: galleryTitle,
      description: galleryDesc || galleryTitle
    };

    setGalleryList(prev => [newItem, ...prev]);
    showSuccess("Cultural event / gallery image added to website!");
    setShowGalleryModal(false);
    setGalleryTitle("");
    setGalleryUrl("");
    setGalleryDesc("");
  };

  const handleDeleteGallery = (id: number) => {
    if (confirm("Delete this photo entry from the gallery?")) {
      setGalleryList(prev => prev.filter(g => g.id !== id));
      showSuccess("Gallery image removed.");
    }
  };

  // ── Event Handlers ──
  const handleOpenEventModal = (eventItem?: any) => {
    if (eventItem) {
      setEditingEvent(eventItem);
      setEventTitle(eventItem.title);
      setEventDate(eventItem.date || "");
      setEventTime(eventItem.time || "9:00 AM – 1:00 PM");
      setEventCategory(eventItem.category || "Cultural");
      setEventDesc(eventItem.description || "");
      setEventImage(eventItem.image || "");
    } else {
      setEditingEvent(null);
      setEventTitle("");
      setEventDate(new Date().toISOString().slice(0, 10));
      setEventTime("9:00 AM – 1:00 PM");
      setEventCategory("Cultural");
      setEventDesc("");
      setEventImage("");
    }
    setShowEventModal(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    if (editingEvent) {
      setEventList(prev => prev.map(ev => ev.id === editingEvent.id ? {
        ...ev,
        title: eventTitle,
        date: eventDate,
        time: eventTime,
        category: eventCategory,
        description: eventDesc,
        image: eventImage || "/images/events/default.jpg"
      } : ev));
      showSuccess("School event updated.");
    } else {
      const newEv = {
        id: Date.now(),
        title: eventTitle,
        date: eventDate || new Date().toISOString().slice(0, 10),
        time: eventTime || "9:00 AM – 1:00 PM",
        description: eventDesc,
        category: eventCategory,
        image: eventImage || "/images/events/default.jpg"
      };
      setEventList(prev => [newEv, ...prev]);
      showSuccess("New school event scheduled & published!");
    }
    setShowEventModal(false);
  };

  const handleDeleteEvent = (id: number) => {
    if (confirm("Remove this event from school calendar?")) {
      setEventList(prev => prev.filter(ev => ev.id !== id));
      showSuccess("Event deleted.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub Navigation Bar */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-sm flex flex-wrap gap-1">
        <button
          onClick={() => setActiveSubTab("metadata")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === "metadata" ? "bg-accent text-white shadow-md" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Settings size={15} /> Site Metadata & Rebranding
        </button>

        <button
          onClick={() => setActiveSubTab("blogs")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === "blogs" ? "bg-accent text-white shadow-md" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <FileText size={15} /> News & Blog Manager ({blogList.length})
        </button>

        <button
          onClick={() => setActiveSubTab("cultural")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === "cultural" ? "bg-accent text-white shadow-md" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Image size={15} /> Cultural Events & Gallery ({galleryList.length})
        </button>

        <button
          onClick={() => setActiveSubTab("events")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === "events" ? "bg-accent text-white shadow-md" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Calendar size={15} /> School Events Calendar ({eventList.length})
        </button>
      </div>

      {/* Global Success Notification */}
      {actionSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-2xl font-bold text-center animate-in fade-in">
          ✓ {actionSuccessMsg}
        </div>
      )}

      {/* ── SUBTAB 1: SITE METADATA ── */}
      {activeSubTab === "metadata" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm h-fit">
            <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
              <Settings size={18} className="text-accent" />
              Website Identity & Metadata
            </h3>

            {configSuccess && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs p-3.5 rounded-2xl font-semibold mb-4 text-center">
                ✓ Parameters updated. Version saved to rollback archives.
              </div>
            )}

            <form onSubmit={handleMetadataSubmit} className="space-y-4">
              <FormInput
                id="cfg-school"
                label="School Full Name"
                value={config.schoolName}
                onChange={(e) => setConfig({ ...config, schoolName: e.target.value })}
                error={formErrors.schoolName}
                required
              />

              <FormInput
                id="cfg-tagline"
                label="School Tagline Description"
                value={config.tagline}
                onChange={(e) => setConfig({ ...config, tagline: e.target.value })}
                error={formErrors.tagline}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <FormInput
                  id="cfg-year"
                  label="Founded Year"
                  type="number"
                  value={config.foundedYear ? String(config.foundedYear) : ""}
                  onChange={(e) => setConfig({ ...config, foundedYear: parseInt(e.target.value) || 0 })}
                  error={formErrors.foundedYear}
                  required
                />
                <FormInput
                  id="cfg-phone"
                  label="Helpline Phone"
                  value={config.phone}
                  onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                  error={formErrors.phone}
                  required
                />
              </div>

              <FormInput
                id="cfg-email"
                label="Public Inquiries Email"
                type="email"
                value={config.email}
                onChange={(e) => setConfig({ ...config, email: e.target.value })}
                error={formErrors.email}
                required
              />

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-accent">Principal&apos;s Message Editor</h4>
                <div className="grid grid-cols-2 gap-3">
                  <FormInput
                    id="cfg-pr-name"
                    label="Principal Full Name"
                    value={config.principalName || ""}
                    onChange={(e) => setConfig({ ...config, principalName: e.target.value })}
                    placeholder="e.g. School Principal"
                  />
                  <FormInput
                    id="cfg-pr-role"
                    label="Qualification / Title"
                    value={config.principalRole || ""}
                    onChange={(e) => setConfig({ ...config, principalRole: e.target.value })}
                    placeholder="e.g. M.A., B.Ed · Leadership Team"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Principal&apos;s Message Text</label>
                  <textarea
                    rows={4}
                    value={config.principalMessage || ""}
                    onChange={(e) => setConfig({ ...config, principalMessage: e.target.value })}
                    placeholder="Type principal's message for the website..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-primary hover:bg-primary-light text-white font-bold rounded-xl text-xs hover:shadow-lg transition-all mt-4 cursor-pointer"
              >
                Commit Website & Principal Changes
              </button>
            </form>
          </div>

          <div className="space-y-6">
            {/* Homepage Hero Banner Image Manager */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <Image size={18} className="text-emerald-600" />
                  Homepage Hero Banner Image
                </h3>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Live Sync
                </span>
              </div>

              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Upload a custom background photo for the homepage hero section. You can upload an image file from your device or paste an image URL.
              </p>

              {/* Current Hero Preview */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-slate-300 shadow-sm bg-slate-950 group">
                <img
                  src={heroBgUrl}
                  alt="Hero Background Preview"
                  className="w-full h-full object-cover brightness-90 group-hover:scale-105 transition-all duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3.5">
                  <span className="text-[11px] font-bold text-white bg-slate-900/80 backdrop-blur-sm px-3 py-1 rounded-xl border border-white/20">
                    Active Hero Banner Photo
                  </span>
                </div>
              </div>

              <ImageUploader
                value={heroBgUrl}
                onChange={handleUpdateHeroBg}
                label="Upload Custom Hero Background (File or URL)"
              />

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <span className="text-xs text-slate-500 font-medium">Restore default campus photo?</span>
                <button
                  type="button"
                  onClick={handleResetHeroBg}
                  className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw size={12} /> Reset to Default
                </button>
              </div>
            </div>

            {/* Rollback Archives */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col">
              <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
                <RotateCcw size={18} className="text-blue-500" />
                Configuration Rollback Archives
              </h3>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[380px] pr-1">
              {configVersions.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No previous change logs committed.</p>
              ) : (
                configVersions.map((v) => (
                  <div
                    key={v.id}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-100/70 hover:border-slate-200 transition-all space-y-2 flex justify-between items-start"
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-700">{v.description}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">
                        Committed: {new Date(v.timestamp).toLocaleString("en-IN")}
                      </p>
                      <p className="text-[9px] text-slate-500 italic">User: {v.changedBy}</p>
                    </div>
                    <button
                      onClick={() => onRollbackConfig(v.id)}
                      className="px-3 py-1 bg-white hover:bg-slate-100 text-xs font-bold border border-slate-200 hover:border-slate-300 rounded-xl text-blue-600 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <RotateCcw size={11} /> Rollback
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* ── SUBTAB 2: BLOG MANAGER ── */}
      {activeSubTab === "blogs" && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">News & Blog Manager</h3>
              <p className="text-xs text-slate-400 mt-0.5">Publish and edit articles visible on the public school website</p>
            </div>
            <button
              onClick={() => handleOpenBlogModal()}
              className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-light text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Plus size={16} /> New Blog Post
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {blogList.map((blog: any) => (
              <div key={blog.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col justify-between space-y-3 hover:shadow-md transition-all">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      {blog.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">{blog.date}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 leading-snug">{blog.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2">{blog.excerpt}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 text-xs">
                  <span className="text-[11px] text-slate-400 font-medium">Author: {blog.author}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleOpenBlogModal(blog)}
                      className="p-1.5 hover:bg-white rounded-lg text-slate-600 hover:text-accent transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                      title="Edit article"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteBlog(blog.id)}
                      className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Delete article"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SUBTAB 3: CULTURAL EVENTS & GALLERY ── */}
      {activeSubTab === "cultural" && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Cultural Events & Photo Gallery</h3>
              <p className="text-xs text-slate-400 mt-0.5">Upload and categorize photos for Annual Day, Sports, Cultural Fest & Campus life</p>
            </div>
            <button
              onClick={() => setShowGalleryModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-light text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Plus size={16} /> Add Photo Entry
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {galleryList.map((item: any) => {
              const imgSrc = item.src || item.url;
              return (
                <div key={item.id} className="group relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 shadow-sm h-48 flex flex-col justify-end p-4">
                  {imgSrc && (imgSrc.startsWith("http") || imgSrc.startsWith("/")) ? (
                    <img src={imgSrc} alt={item.alt || item.title || "Gallery Photo"} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-primary to-slate-900 opacity-90" />
                  )}
                  <div className="relative z-10 space-y-1">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-accent text-white">
                      {item.category}
                    </span>
                    <h4 className="text-sm font-bold text-white leading-tight">{item.alt || item.title || "Campus Photo"}</h4>
                    <p className="text-[11px] text-white/70 truncate">{item.description || item.alt || item.title}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteGallery(item.id)}
                    className="absolute top-3 right-3 z-20 p-1.5 bg-rose-600/90 text-white rounded-lg hover:bg-rose-700 transition-colors shadow-lg cursor-pointer"
                    title="Remove image"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── SUBTAB 4: SCHOOL EVENTS CALENDAR ── */}
      {activeSubTab === "events" && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">School Events & Annual Calendar</h3>
              <p className="text-xs text-slate-400 mt-0.5">Schedule upcoming competitions, celebrations, PTMs, and sports meets</p>
            </div>
            <button
              onClick={() => handleOpenEventModal()}
              className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-light text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Plus size={16} /> Schedule Event
            </button>
          </div>

          <div className="space-y-3">
            {eventList.map((ev: any) => (
              <div key={ev.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-4 hover:bg-slate-100/50 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary text-white flex flex-col items-center justify-center font-bold shrink-0 shadow-sm">
                    <span className="text-[10px] uppercase opacity-75">{ev.date ? new Date(ev.date).toLocaleString('default', { month: 'short' }) : 'AUG'}</span>
                    <span className="text-base leading-none">{ev.date ? new Date(ev.date).getDate() : '15'}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-800">{ev.title}</h4>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                        {ev.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{ev.description}</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1">⏰ {ev.time}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-auto sm:ml-0">
                  <button
                    onClick={() => handleOpenEventModal(ev)}
                    className="p-2 hover:bg-white rounded-xl text-slate-600 hover:text-accent transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
                    title="Edit event"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(ev.id)}
                    className="p-2 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Delete event"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── BLOG MODAL ── */}
      {showBlogModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">{editingBlog ? "Edit Blog Article" : "Create New Blog Post"}</h3>
              <button onClick={() => setShowBlogModal(false)} className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveBlog} className="space-y-4">
              <FormInput id="b-title" label="Article Title" value={blogTitle} onChange={(e) => setBlogTitle(e.target.value)} required />
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Category</label>
                  <select
                    value={blogCategory}
                    onChange={(e) => setBlogCategory(e.target.value)}
                    className="w-full px-3.5 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm font-semibold focus:bg-white focus:outline-none"
                  >
                    <option value="Achievements">Achievements</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Admissions">Admissions</option>
                    <option value="Academic">Academic</option>
                    <option value="Cultural">Cultural Events</option>
                  </select>
                </div>
                <FormInput id="b-author" label="Author / Byline" value={blogAuthor} onChange={(e) => setBlogAuthor(e.target.value)} required />
              </div>

              <ImageUploader label="Article Cover Image (Paste URL or Upload File)" value={blogImage} onChange={setBlogImage} />

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Short Excerpt</label>
                <textarea
                  rows={2}
                  value={blogExcerpt}
                  onChange={(e) => setBlogExcerpt(e.target.value)}
                  placeholder="Brief 1-2 sentence summary for article card..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Full Article Content (Markdown / Text)</label>
                <textarea
                  rows={6}
                  value={blogContent}
                  onChange={(e) => setBlogContent(e.target.value)}
                  placeholder="Write full news article content..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs focus:bg-white focus:outline-none font-mono"
                  required
                />
              </div>

              <button type="submit" className="w-full py-3.5 bg-accent hover:bg-accent-light text-white font-bold rounded-xl text-xs shadow-lg transition-all cursor-pointer">
                {editingBlog ? "Save Article Changes" : "Publish Article Live"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── GALLERY MODAL ── */}
      {showGalleryModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Add Cultural / Event Photo</h3>
              <button onClick={() => setShowGalleryModal(false)} className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveGallery} className="space-y-4">
              <FormInput id="g-title" label="Photo Caption / Event Title" value={galleryTitle} onChange={(e) => setGalleryTitle(e.target.value)} placeholder="e.g. Annual Day Dance Performance" required />
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Category</label>
                <select
                  value={galleryCategory}
                  onChange={(e) => setGalleryCategory(e.target.value)}
                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm font-semibold focus:bg-white focus:outline-none"
                >
                  <option value="Cultural Events">Cultural Events</option>
                  <option value="Sports">Sports & Athletics</option>
                  <option value="Campus">Campus & Infrastructure</option>
                  <option value="Classrooms">Classrooms & Labs</option>
                  <option value="Library">Library & Study</option>
                </select>
              </div>

              <ImageUploader label="Photo File (Paste URL or Upload Image File)" value={galleryUrl} onChange={setGalleryUrl} />

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={galleryDesc}
                  onChange={(e) => setGalleryDesc(e.target.value)}
                  placeholder="Short description..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs focus:bg-white focus:outline-none"
                />
              </div>

              <button type="submit" className="w-full py-3.5 bg-accent hover:bg-accent-light text-white font-bold rounded-xl text-xs shadow-lg transition-all cursor-pointer">
                Add Photo to Website Gallery
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── EVENT MODAL ── */}
      {showEventModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">{editingEvent ? "Edit Event" : "Schedule School Event"}</h3>
              <button onClick={() => setShowEventModal(false)} className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4">
              <FormInput id="ev-title" label="Event Name" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} placeholder="e.g. Annual Cultural Fest 2026" required />
              
              <div className="grid grid-cols-2 gap-3">
                <FormInput id="ev-date" label="Event Date" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required />
                <FormInput id="ev-time" label="Time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} placeholder="8:00 AM – 2:00 PM" required />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Category</label>
                <select
                  value={eventCategory}
                  onChange={(e) => setEventCategory(e.target.value)}
                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm font-semibold focus:bg-white focus:outline-none"
                >
                  <option value="Cultural">Cultural</option>
                  <option value="Sports">Sports</option>
                  <option value="Academic">Academic</option>
                  <option value="Meeting">Meeting / PTM</option>
                  <option value="National">National Day</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Event Description</label>
                <textarea
                  rows={3}
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  placeholder="Details for students and parents..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <button type="submit" className="w-full py-3.5 bg-accent hover:bg-accent-light text-white font-bold rounded-xl text-xs shadow-lg transition-all cursor-pointer">
                {editingEvent ? "Save Event Changes" : "Schedule & Publish Event"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
