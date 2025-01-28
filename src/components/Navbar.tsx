'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  NavigationMenu, 
  NavigationMenuItem, 
  NavigationMenuLink, 
  NavigationMenuList, 
  navigationMenuTriggerStyle 
} from '@/components/ui/navigation-menu'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { NavItems } from '@/lib/NavItems'
import GradientText from './GradientTextDefault'

export default function Navbar() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm dark:bg-gray-900">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-3xl font-bold text-primary">
          <GradientText className='p-1'>GloryBank</GradientText>
        </Link>
        {!pathname.startsWith('/login') && (<>
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden" 
          onClick={toggleMenu}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </Button>

        <NavigationMenu className="hidden md:block">
          <NavigationMenuList>
            {NavItems.map((item) => (
              <NavigationMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior passHref>
                  <NavigationMenuLink
                    className={cn(
                      navigationMenuTriggerStyle(),
                      pathname === item.href 
                        ? 'bg-accent text-accent-foreground' 
                        : 'text-muted-foreground'
                    )}
                    >
                    {item.label}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-900 md:hidden">
            <div className="flex flex-col items-center space-y-4 py-4">
              {NavItems.map((item) => (
                <Link 
                key={item.href}
                href={item.href} 
                className={cn(
                  "text-lg font-medium transition-colors hover:text-primary",
                    pathname === item.href 
                      ? 'text-primary' 
                      : 'text-muted-foreground'
                  )}
                  onClick={toggleMenu}
                  >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </>)}
      </div> 
    </nav>
  )
}