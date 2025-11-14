import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Building2,
  Camera,
  Clock,
  Facebook,
  Globe,
  Home,
  Loader2,
  MapPin,
  Mail,
  Phone,
  Quote,
  RefreshCw,
  Save,
  ShieldCheck,
  SplitSquareVertical,
  UploadCloud,
  Youtube,
  Music,
} from 'lucide-react';
import { settingsService } from '@/services/center-owner/settings-management/settings.service';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { dayOptions } from '@/utils/commonData';
import { provincesService, type Province, type District } from '@/services/common/provinces.service';

type WorkingHour = {
  fromDay: string;
  toDay: string;
  open: string;
  close: string;
};

type CenterInfoForm = {
  centerInfo: {
    name: string;
    logo: string;
    banner: string;
    description: string;
    slogan: string;
  };
  contact: {
    phone: string;
    email: string;
    website: string;
    facebook?: string;
    youtube?: string;
    tiktok?: string;
    workingHours: WorkingHour[];
  };
  address: {
    street: string;
    province: string; // province code (number as string)
    district: string; // district code (number as string)
    detail: string;
  };
};

type ImageFiles = {
  logo: File | null;
  banner: File | null;
};

type CenterSettingRecord = {
  id: string;
  key: string;
  group: string;
  value?: Partial<CenterInfoForm>;
  description?: string;
  updatedAt?: string;
};


const createEmptyForm = (): CenterInfoForm => ({
  centerInfo: {
    name: '',
    logo: '',
    banner: '',
    description: '',
    slogan: '',
  },
  contact: {
    phone: '',
    email: '',
    website: '',
    facebook: '',
    youtube: '',
    tiktok: '',
    workingHours: [
      { fromDay: 'monday', toDay: 'friday', open: '08:00', close: '17:30' },
    ],
  },
  address: {
    street: '',
    province: '',
    district: '',
    detail: '',
  },
});

const mergeWithDefaults = (raw?: Partial<CenterInfoForm>): CenterInfoForm => {
  const base = createEmptyForm();
  const normalizeWorkingHours = (items?: any[]): WorkingHour[] => {
    if (!Array.isArray(items) || items.length === 0) {
      return base.contact.workingHours;
    }
    return items.map((slot) => {
      if (slot && typeof slot === 'object') {
        if ('day' in slot) {
          return {
            fromDay: slot.day,
            toDay: slot.day,
            open: slot.open || '08:00',
            close: slot.close || '17:30',
          };
        }
        return {
          fromDay: slot.fromDay || 'monday',
          toDay: slot.toDay || slot.fromDay || 'friday',
          open: slot.open || '08:00',
          close: slot.close || '17:30',
        };
      }
      return { ...base.contact.workingHours[0] };
    });
  };
  return {
    centerInfo: {
      ...base.centerInfo,
      ...(raw?.centerInfo || {}),
    },
    contact: {
      ...base.contact,
      ...(raw?.contact || {}),
      workingHours: normalizeWorkingHours(raw?.contact?.workingHours),
    },
    address: {
      ...base.address,
      ...(raw?.address || {}),
    },
  };
};

const allowedImageTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export function CenterInfoSetting() {
  const [formData, setFormData] = useState<CenterInfoForm>(() => createEmptyForm());
  const [initialData, setInitialData] = useState<CenterInfoForm>(() => createEmptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageFiles, setImageFiles] = useState<ImageFiles>({
    logo: null,
    banner: null,
  });
  const [imagePreviews, setImagePreviews] = useState<{
    logo: string | null;
    banner: string | null;
  }>({
    logo: null,
    banner: null,
  });

  // Provinces và districts data
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);

  const {
    data: setting,
    isPending,
    isFetching,
    refetch,
  } = useQuery<CenterSettingRecord | null>({
    queryKey: ['center-info-setting'],
    queryFn: async () => {
      const result = await settingsService.getCenterInfo() as any;
      return (result?.data as CenterSettingRecord) ?? null;
    },
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (setting) {
      if (setting.value) {
        // Prisma trả về value là object (JSONB được parse tự động)
        const merged = mergeWithDefaults(setting.value as Partial<CenterInfoForm>);
        
        // Convert old format (codename) to new format (code) nếu cần
        if (merged.address.province && provinces.length > 0) {
          const provinceCode = parseInt(merged.address.province);
          if (isNaN(provinceCode)) {
            // Old format: tìm province theo codename
            const province = provinces.find(p => p.codename === merged.address.province);
            if (province) {
              merged.address.province = province.code.toString();
              // Tìm district tương ứng
              if (merged.address.district) {
                const districtCode = parseInt(merged.address.district);
                if (isNaN(districtCode)) {
                  const district = province.districts?.find(d => d.codename === merged.address.district);
                  if (district) {
                    merged.address.district = district.code.toString();
                  }
                }
              }
            }
          }
        }
        
        setFormData(merged);
        setInitialData(merged);
        // Set preview từ URL đã có
        setImagePreviews({
          logo: merged.centerInfo.logo || null,
          banner: merged.centerInfo.banner || null,
        });
      } else {
        // Chưa có data, reset về form trống
        const reset = createEmptyForm();
        setFormData(reset);
        setInitialData(reset);
        setImagePreviews({ logo: null, banner: null });
      }
    }
  }, [setting, provinces]);

  const mutation = useMutation<CenterSettingRecord, unknown, FormData>({
    mutationFn: async (formDataPayload) => {
      const result = await settingsService.updateCenterInfo(formDataPayload) as any;
      return (result?.data as CenterSettingRecord) ?? null;
    },
    onSuccess: (res) => {
      const merged = mergeWithDefaults(res?.value);
      setInitialData(merged);
      setFormData(merged);
      setImageFiles({ logo: null, banner: null });
      setImagePreviews({
        logo: merged.centerInfo.logo || null,
        banner: merged.centerInfo.banner || null,
      });
      toast.success('Đã lưu thông tin trung tâm');
      refetch();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || 'Không thể lưu thông tin');
    },
  });

  const isDirty = useMemo(
    () => {
      const formChanged = JSON.stringify(formData) !== JSON.stringify(initialData);
      const filesChanged = imageFiles.logo !== null || imageFiles.banner !== null;
      return formChanged || filesChanged;
    },
    [formData, initialData, imageFiles],
  );

  const weekdayOrder = dayOptions.map((item) => item.value);

  // Fetch provinces khi component mount
  useEffect(() => {
    const fetchProvinces = async () => {
      setLoadingProvinces(true);
      try {
        const data = await provincesService.getProvincesWithDistricts();
        setProvinces(data);
      } catch (error) {
        console.error('Error fetching provinces:', error);
        toast.error('Không thể tải danh sách tỉnh thành');
      } finally {
        setLoadingProvinces(false);
      }
    };
    fetchProvinces();
  }, []);

  // Fetch districts khi province thay đổi
  useEffect(() => {
    const loadDistricts = async () => {
      if (!formData.address.province) {
        setDistricts([]);
        return;
      }

      try {
        const provinceCode = parseInt(formData.address.province);
        if (isNaN(provinceCode)) {
          // Nếu là old format (string), tìm trong provinces đã load
          const province = provinces.find(p => p.codename === formData.address.province);
          if (province) {
            setDistricts(province.districts || []);
          } else {
            setDistricts([]);
          }
        } else {
          // Nếu là new format (code), tìm trong provinces đã load trước
          const province = provinces.find(p => p.code === provinceCode);
          if (province && province.districts) {
            // Dùng districts từ province đã load (tối ưu hơn)
            setDistricts(province.districts);
          } else {
            // Nếu không có trong cache, fetch từ API
            const data = await provincesService.getDistrictsByProvince(provinceCode);
            setDistricts(data);
          }
        }
      } catch (error) {
        console.error('Error loading districts:', error);
        toast.error('Không thể tải danh sách quận huyện');
        setDistricts([]);
      }
    };

    loadDistricts();
  }, [formData.address.province, provinces]);

  const getDayIndex = (day: string) => {
    const idx = weekdayOrder.indexOf(day);
    return idx === -1 ? weekdayOrder.length : idx;
  };

  const validateForm = (payload: CenterInfoForm) => {
    const nextErrors: Record<string, string> = {};

    if (!payload.centerInfo.name.trim()) {
      nextErrors['centerInfo.name'] = 'Tên trung tâm là bắt buộc';
    }
    if (!payload.centerInfo.description.trim()) {
      nextErrors['centerInfo.description'] = 'Mô tả ngắn không được để trống';
    }
    if (!payload.contact.phone.trim()) {
      nextErrors['contact.phone'] = 'Số điện thoại là bắt buộc';
    } else if (!/^0\d{9,10}$/.test(payload.contact.phone.trim())) {
      nextErrors['contact.phone'] = 'Số điện thoại không hợp lệ';
    }
    if (!payload.contact.email.trim()) {
      nextErrors['contact.email'] = 'Email quản lý là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.contact.email.trim())) {
      nextErrors['contact.email'] = 'Email không hợp lệ';
    }
    if (payload.contact.website && !/^https?:\/\//.test(payload.contact.website.trim())) {
      nextErrors['contact.website'] = 'Website phải bắt đầu bằng http hoặc https';
    }
    if (payload.contact.facebook && payload.contact.facebook.trim() && !/^https?:\/\//.test(payload.contact.facebook.trim())) {
      nextErrors['contact.facebook'] = 'Facebook URL phải bắt đầu bằng http hoặc https';
    }
    if (payload.contact.youtube && payload.contact.youtube.trim() && !/^https?:\/\//.test(payload.contact.youtube.trim())) {
      nextErrors['contact.youtube'] = 'YouTube URL phải bắt đầu bằng http hoặc https';
    }
    if (payload.contact.tiktok && payload.contact.tiktok.trim() && !/^https?:\/\//.test(payload.contact.tiktok.trim())) {
      nextErrors['contact.tiktok'] = 'TikTok URL phải bắt đầu bằng http hoặc https';
    }
    payload.contact.workingHours.forEach((slot, index) => {
      if (!slot.fromDay || !slot.toDay) {
        nextErrors[`contact.workingHours.${index}`] = 'Vui lòng chọn khoảng ngày làm việc';
        return;
      }
      if (getDayIndex(slot.fromDay) > getDayIndex(slot.toDay)) {
        nextErrors[`contact.workingHours.${index}`] = 'Ngày bắt đầu phải trước hoặc bằng ngày kết thúc';
      }
      if (!slot.open || !slot.close) {
        nextErrors[`contact.workingHours.${index}`] = 'Thiếu giờ mở/đóng';
        return;
      }
      if (slot.open >= slot.close) {
        nextErrors[`contact.workingHours.${index}`] = 'Giờ mở phải trước giờ đóng';
      }
    });
    if (!payload.address.province) {
      nextErrors['address.province'] = 'Chọn Tỉnh/Thành';
    }
    if (!payload.address.district) {
      nextErrors['address.district'] = 'Chọn Quận/Huyện';
    }
    if (!payload.address.street.trim()) {
      nextErrors['address.street'] = 'Địa chỉ không được để trống';
    }
    if (!payload.address.detail.trim()) {
      nextErrors['address.detail'] = 'Địa chỉ chi tiết không được để trống';
    }

    return nextErrors;
  };

  const updateSectionField = <T extends keyof CenterInfoForm>(
    section: T,
    field: keyof CenterInfoForm[T],
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as Record<string, any>),
        [field]: value,
      },
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`${section}.${String(field)}`];
      return next;
    });
  };

  const handleProvinceChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, province: value, district: '' },
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next['address.province'];
      delete next['address.district'];
      return next;
    });
    // Reset districts khi đổi province
    setDistricts([]);
  };

  const handleWorkingHourChange = (
    index: number,
    key: keyof WorkingHour,
    value: string,
  ) => {
    setFormData((prev) => {
      const updated = [...prev.contact.workingHours];
      updated[index] = { ...updated[index], [key]: value };
      return {
        ...prev,
        contact: { ...prev.contact, workingHours: updated },
      };
    });
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`contact.workingHours.${index}`];
      return next;
    });
  };

  const addWorkingHour = () => {
    setFormData((prev) => ({
      ...prev,
      contact: {
        ...prev.contact,
        workingHours: [
          ...prev.contact.workingHours,
          { fromDay: 'monday', toDay: 'friday', open: '08:00', close: '17:30' },
        ],
      },
    }));
  };

  const removeWorkingHour = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      contact: {
        ...prev.contact,
        workingHours: prev.contact.workingHours.filter((_, i) => i !== index),
      },
    }));
  };

  const isValidFile = (file?: File | null) => {
    if (!file) return false;
    if (!allowedImageTypes.includes(file.type)) {
      toast.error('Định dạng ảnh không hợp lệ');
      return false;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error('Dung lượng ảnh tối đa 10MB');
      return false;
    }
    return true;
  };

  const handleImageUpload = (file: File | null | undefined, field: 'logo' | 'banner') => {
    if (!file || !isValidFile(file)) return;
    
    // Lưu file vào state
    setImageFiles((prev) => ({ ...prev, [field]: file }));
    
    // Tạo preview từ file
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      setImagePreviews((prev) => ({ ...prev, [field]: preview }));
    };
    reader.onerror = () => {
      toast.error('Không thể đọc file');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (field: 'logo' | 'banner') => {
    setImageFiles((prev) => ({ ...prev, [field]: null }));
    setImagePreviews((prev) => ({ ...prev, [field]: null }));
    // Nếu có URL cũ từ database, giữ lại
    if (initialData.centerInfo[field]) {
      setImagePreviews((prev) => ({ ...prev, [field]: initialData.centerInfo[field] }));
    }
  };

  const handleSave = () => {
    const validation = validateForm(formData);
    setErrors(validation);
    if (Object.keys(validation).length > 0) {
      toast.error('Vui lòng kiểm tra lại thông tin');
      return;
    }
    
    // Tạo FormData để gửi files và data
    const formDataToSend = new FormData();
    formDataToSend.append('data', JSON.stringify(formData));
    
    if (imageFiles.logo) {
      formDataToSend.append('logoFile', imageFiles.logo);
    }
    if (imageFiles.banner) {
      formDataToSend.append('bannerFile', imageFiles.banner);
    }
    
    mutation.mutate(formDataToSend as any);
  };

  const handleReset = () => {
    setFormData(initialData);
    setErrors({});
    setImageFiles({ logo: null, banner: null });
    setImagePreviews({
      logo: initialData.centerInfo.logo || null,
      banner: initialData.centerInfo.banner || null,
    });
  };

  const lastUpdated = setting?.updatedAt
    ? new Date(setting.updatedAt).toLocaleString('vi-VN')
    : null;

  if (isPending && !setting) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/manager">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Thông tin trung tâm</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4" />
                <span>Thông tin hiển thị công khai và nội bộ</span>
              </div>
              <h1 className="mt-2 text-3xl font-semibold text-foreground">
                Quản lý thông tin trung tâm
              </h1>
              {/* <p className="text-muted-foreground">
                Cập nhật thương hiệu, thông tin liên hệ và địa chỉ hoạt động.
              </p> */}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={handleReset}
                disabled={!isDirty}
              >
                <SplitSquareVertical className="mr-2 h-4 w-4" />
                Hủy thay đổi
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={!isDirty || mutation.isPending}
              >
                {mutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Lưu thay đổi
              </Button>
            </div>
          </div>

          {/* {lastUpdated && (
            <p className="text-xs text-muted-foreground">
              Cập nhật lần cuối:{' '}
              <span className="font-medium">{lastUpdated}</span>
            </p>
          )} */}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Thông tin trung tâm
              </CardTitle>
              {/* <CardDescription>
                Những thông tin cốt lõi hiển thị công khai.
              </CardDescription> */}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="center-name">
                    Tên trung tâm <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="center-name"
                      placeholder="Ví dụ: SEP Learning Center"
                      value={formData.centerInfo.name}
                      onChange={(e) =>
                        updateSectionField('centerInfo', 'name', e.target.value)
                      }
                      className={
                        errors['centerInfo.name'] ? 'border-destructive' : ''
                      }
                    />
                  </div>
                  {errors['centerInfo.name'] && (
                    <p className="text-sm text-destructive">
                      {errors['centerInfo.name']}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="center-slogan">Slogan (không bắt buộc)</Label>
                  <div className="flex items-center gap-2">
                    <Quote className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="center-slogan"
                      placeholder="Lan tỏa tri thức - Khai mở tương lai"
                      value={formData.centerInfo.slogan}
                      onChange={(e) =>
                        updateSectionField(
                          'centerInfo',
                          'slogan',
                          e.target.value,
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <Label>Logo</Label>
                  <div className="flex items-center gap-4">
                    <div className="h-56 w-56 overflow-hidden rounded-lg border bg-white p-2">
                      {imagePreviews.logo ? (
                        <img
                          src={imagePreviews.logo}
                          alt="Logo preview"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                          Chưa có logo
                        </div>
                      )}
                    </div>
                    <div>
                      <Label
                        htmlFor="logo-upload"
                        className="flex cursor-pointer items-center gap-2 text-sm font-medium text-primary"
                      >
                        <UploadCloud className="h-4 w-4" />
                        Tải logo
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, WEBP &lt; 10MB
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Vui lòng sử dụng ảnh xóa nền
                      </p>
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleImageUpload(e.target.files?.[0], 'logo')
                        }
                      />
                      {/* <div className="flex items-center gap-2">
                        <Button
                          variant="link"
                          className="h-auto p-0 text-xs"
                          onClick={() => handleRemoveImage('logo')}
                          disabled={!imagePreviews.logo}
                        >
                          Xóa logo
                        </Button>
                      </div> */}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label>Ảnh cover / banner</Label>
                  <div className="flex items-center gap-4">
                    <div className="h-full w-full overflow-hidden rounded-lg border bg-white p-2">
                      {imagePreviews.banner ? (
                        <img
                          src={imagePreviews.banner}
                          alt="Banner preview"
                          className="h-full w-full rounded-md object-cover"
                        />
                      ) : (
                        <div className="flex h-56 w-full items-center justify-center text-xs text-muted-foreground">
                          Chưa có banner
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label
                        htmlFor="banner-upload"
                        className="flex cursor-pointer items-center gap-2 text-sm font-medium text-primary"
                      >
                        <Camera className="h-4 w-4" />
                        Tải banner
                      </Label>
                      <input
                        id="banner-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleImageUpload(e.target.files?.[0], 'banner')
                        }
                      />
                      {/* <div className="flex items-center gap-2">
                        <Button
                          variant="link"
                          className="h-auto p-0 text-xs"
                          onClick={() => handleRemoveImage('banner')}
                          disabled={!imagePreviews.banner}
                        >
                          Xóa banner
                        </Button>
                      </div> */}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="center-description">
                  Mô tả ngắn <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="center-description"
                  rows={4}
                  placeholder="Giới thiệu ngắn gọn về trung tâm, chương trình đào tạo..."
                  value={formData.centerInfo.description}
                  onChange={(e) =>
                    updateSectionField(
                      'centerInfo',
                      'description',
                      e.target.value,
                    )
                  }
                  className={
                    errors['centerInfo.description'] ? 'border-destructive' : ''
                  }
                />
                {errors['centerInfo.description'] && (
                  <p className="text-sm text-destructive">
                    {errors['centerInfo.description']}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                Thông tin liên hệ
              </CardTitle>
              <CardDescription>
                Các kênh liên hệ chính với trung tâm.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 min-w-0">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="contact-phone">
                    Số điện thoại chính <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="contact-phone"
                      placeholder="0987 654 321"
                      value={formData.contact.phone}
                      onChange={(e) =>
                        updateSectionField('contact', 'phone', e.target.value)
                      }
                      className={
                        errors['contact.phone'] ? 'border-destructive' : ''
                      }
                    />
                  </div>
                  {errors['contact.phone'] && (
                    <p className="text-sm text-destructive">
                      {errors['contact.phone']}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-email">
                    Email quản lý/CSKH <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="contact-email"
                      type="email"
                      placeholder="support@sep-center.vn"
                      value={formData.contact.email}
                      onChange={(e) =>
                        updateSectionField('contact', 'email', e.target.value)
                      }
                      className={
                        errors['contact.email'] ? 'border-destructive' : ''
                      }
                    />
                  </div>
                  {errors['contact.email'] && (
                    <p className="text-sm text-destructive">
                      {errors['contact.email']}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-website">Website (nếu có)</Label>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="contact-website"
                      placeholder="https://sep-center.vn"
                      value={formData.contact.website}
                      onChange={(e) =>
                        updateSectionField('contact', 'website', e.target.value)
                      }
                      className={
                        errors['contact.website'] ? 'border-destructive' : ''
                      }
                    />
                  </div>
                  {errors['contact.website'] && (
                    <p className="text-sm text-destructive">
                      {errors['contact.website']}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="contact-facebook">Facebook (nếu có)</Label>
                  <div className="flex items-center gap-2">
                    <Facebook className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="contact-facebook"
                      placeholder="https://facebook.com/sep-center"
                      value={formData.contact.facebook || ''}
                      onChange={(e) =>
                        updateSectionField('contact', 'facebook', e.target.value)
                      }
                      className={
                        errors['contact.facebook'] ? 'border-destructive' : ''
                      }
                    />
                  </div>
                  {errors['contact.facebook'] && (
                    <p className="text-sm text-destructive">
                      {errors['contact.facebook']}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-youtube">YouTube (nếu có)</Label>
                  <div className="flex items-center gap-2">
                    <Youtube className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="contact-youtube"
                      placeholder="https://youtube.com/@sep-center"
                      value={formData.contact.youtube || ''}
                      onChange={(e) =>
                        updateSectionField('contact', 'youtube', e.target.value)
                      }
                      className={
                        errors['contact.youtube'] ? 'border-destructive' : ''
                      }
                    />
                  </div>
                  {errors['contact.youtube'] && (
                    <p className="text-sm text-destructive">
                      {errors['contact.youtube']}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-tiktok">TikTok (nếu có)</Label>
                  <div className="flex items-center gap-2">
                    <Music className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="contact-tiktok"
                      placeholder="https://tiktok.com/@sep-center"
                      value={formData.contact.tiktok || ''}
                      onChange={(e) =>
                        updateSectionField('contact', 'tiktok', e.target.value)
                      }
                      className={
                        errors['contact.tiktok'] ? 'border-destructive' : ''
                      }
                    />
                  </div>
                  {errors['contact.tiktok'] && (
                    <p className="text-sm text-destructive">
                      {errors['contact.tiktok']}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4 overflow-hidden">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    Giờ làm việc (ngày – khung giờ)
                  </Label>
                </div>

                <div className="space-y-3 min-w-0">
                  {formData.contact.workingHours.map((slot, index) => (
                    <div
                      key={`working-hour-${index}`}
                      className="grid gap-3 rounded-lg border bg-white p-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                    >
                      <div className="space-y-1 min-w-0">
                        <span className="text-xs font-medium text-muted-foreground">
                          Từ
                        </span>
                        <Select
                          value={slot.fromDay}
                          onValueChange={(value) =>
                            handleWorkingHourChange(index, 'fromDay', value)
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Chọn ngày bắt đầu" />
                          </SelectTrigger>
                          <SelectContent>
                            {dayOptions.map((day) => (
                              <SelectItem
                                key={`from-${day.value}`}
                                value={day.value}
                              >
                                {day.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1 min-w-0">
                        <span className="text-xs font-medium text-muted-foreground">
                          Đến
                        </span>
                        <Select
                          value={slot.toDay}
                          onValueChange={(value) =>
                            handleWorkingHourChange(index, 'toDay', value)
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Chọn ngày kết thúc" />
                          </SelectTrigger>
                          <SelectContent>
                            {dayOptions.map((day) => (
                              <SelectItem
                                key={`to-${day.value}`}
                                value={day.value}
                              >
                                {day.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1 min-w-0">
                        <span className="text-xs font-medium text-muted-foreground">
                          Giờ mở
                        </span>
                        <Input
                          type="time"
                          value={slot.open}
                          onChange={(e) =>
                            handleWorkingHourChange(
                              index,
                              'open',
                              e.target.value,
                            )
                          }
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-1 min-w-0">
                        <span className="text-xs font-medium text-muted-foreground">
                          Giờ đóng
                        </span>
                        <Input
                          type="time"
                          value={slot.close}
                          onChange={(e) =>
                            handleWorkingHourChange(
                              index,
                              'close',
                              e.target.value,
                            )
                          }
                          className="w-full"
                        />
                      </div>

                      {errors[`contact.workingHours.${index}`] && (
                        <p className="col-span-full text-sm text-destructive">
                          {errors[`contact.workingHours.${index}`]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Địa chỉ
              </CardTitle>
              <CardDescription>Thông tin định vị trung tâm.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="address-province">
                    Tỉnh/Thành <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.address.province}
                    onValueChange={handleProvinceChange}
                    disabled={loadingProvinces}
                  >
                    <SelectTrigger id="address-province">
                      <SelectValue placeholder={loadingProvinces ? "Đang tải..." : "Chọn Tỉnh/Thành"} />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map((province) => (
                        <SelectItem key={province.code} value={province.code.toString()}>
                          {province.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors['address.province'] && (
                    <p className="text-sm text-destructive">
                      {errors['address.province']}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address-district">
                    Quận/Huyện <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.address.district}
                    onValueChange={(value) =>
                      updateSectionField('address', 'district', value)
                    }
                    disabled={!formData.address.province || districts.length === 0}
                  >
                    <SelectTrigger id="address-district">
                      <SelectValue placeholder={
                        !formData.address.province 
                          ? "Chọn Tỉnh/Thành trước" 
                          : districts.length === 0 
                            ? "Đang tải..." 
                            : "Chọn Quận/Huyện"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.length === 0 && formData.address.province && (
                        <SelectItem value="__empty" disabled>
                          Đang tải danh sách quận huyện...
                        </SelectItem>
                      )}
                      {districts.map((district) => (
                        <SelectItem key={district.code} value={district.code.toString()}>
                          {district.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors['address.district'] && (
                    <p className="text-sm text-destructive">
                      {errors['address.district']}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="address-street">
                    Địa chỉ <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="address-street"
                      placeholder="Số 123, đường Nguyễn Văn Cừ"
                      value={formData.address.street}
                      onChange={(e) =>
                        updateSectionField('address', 'street', e.target.value)
                      }
                      className={
                        errors['address.street'] ? 'border-destructive' : ''
                      }
                    />
                  </div>
                  {errors['address.street'] && (
                    <p className="text-sm text-destructive">
                      {errors['address.street']}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address-detail">
                    Địa chỉ chi tiết <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="address-detail"
                      placeholder="Tầng 5, tòa nhà ABC, phường XYZ"
                      value={formData.address.detail}
                      onChange={(e) =>
                        updateSectionField('address', 'detail', e.target.value)
                      }
                      className={
                        errors['address.detail'] ? 'border-destructive' : ''
                      }
                    />
                  </div>
                  {errors['address.detail'] && (
                    <p className="text-sm text-destructive">
                      {errors['address.detail']}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="flex gap-2 justify-center">
          <Button
            variant="outline"
            type="button"
            onClick={handleReset}
            disabled={!isDirty}
          >
            <SplitSquareVertical className="mr-2 h-4 w-4" />
            Hủy thay đổi
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || mutation.isPending}
          >
            {mutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Lưu thay đổi
          </Button>
        </div>
      </div>
    </div>
  );
}

