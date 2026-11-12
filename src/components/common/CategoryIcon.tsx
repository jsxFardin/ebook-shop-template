import {
  BatteryCharging, Bluetooth, BookOpen, Briefcase, Cable, Calculator, Coffee, Cpu, Droplet, FileText, Headphones, Keyboard,
  Lamp, Leaf, MoonStar, Moon, Mouse, RectangleEllipsis, Palette, Pencil, PencilLine, PenTool, Scissors, Shirt, ShoppingBag, ShoppingBasket,
  Smartphone, Square, Watch, type LucideIcon,
} from 'lucide-react'

const map: Record<string, LucideIcon> = {
  BatteryCharging, Bluetooth, BookOpen, Briefcase, Cable, Calculator, Coffee, Cpu, Droplet, FileText, Headphones, Keyboard,
  Lamp, Leaf, MoonStar, Moon, Mouse, RectangleEllipsis, Palette, Pencil, PencilLine, PenTool, Scissors, Shirt, ShoppingBag, ShoppingBasket,
  Smartphone, Square, Watch,
}
export const iconFor = (name: string): LucideIcon => map[name] ?? ShoppingBag
