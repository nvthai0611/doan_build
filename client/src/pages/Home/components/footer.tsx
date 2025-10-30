"use client"

import { GraduationCap, Mail, Phone, MapPin, Facebook, Twitter, Linkedin } from "lucide-react"

export const Footer = () => {
  return (
    <footer className="gradient-bg text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-white/20 p-2 rounded-lg">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">Trung Tâm Giáo Dục</span>
            </div>
            <p className="text-sm opacity-90">Nơi khơi nguồn tri thức, nuôi dưỡng tương lai của thế hệ trẻ.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Liên Kết Nhanh</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="opacity-90 hover:opacity-100 transition-opacity">
                  Về Chúng Tôi
                </a>
              </li>
              <li>
                <a href="#" className="opacity-90 hover:opacity-100 transition-opacity">
                  Lớp Học
                </a>
              </li>
              <li>
                <a href="#" className="opacity-90 hover:opacity-100 transition-opacity">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="opacity-90 hover:opacity-100 transition-opacity">
                  Liên Hệ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Liên Hệ</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>1900 1234</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>info@center.edu</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>123 Đường ABC, TP. HCM</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold mb-4">Theo Dõi</h3>
            <div className="flex gap-4">
              <a href="#" className="opacity-90 hover:opacity-100 transition-opacity">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="opacity-90 hover:opacity-100 transition-opacity">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="opacity-90 hover:opacity-100 transition-opacity">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 pt-8 text-center text-sm opacity-90">
          <p>&copy; 2025 Trung Tâm Giáo Dục. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  )
}
