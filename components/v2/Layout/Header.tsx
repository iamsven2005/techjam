import * as React from 'react';
import Link from 'next/link';
import {
  Bars3Icon,
  ShoppingCartIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';

import BookTypeMenu from 'components/v2/Layout/BookTypeMenu';
import { shoppingCartState } from 'atoms';
import { useRecoilState } from 'recoil';

import { calcCartItemSum } from 'lib/utils';
import { Button } from '../ui/button';
import { UserIcon } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';

export interface HeaderProps {
  hideMenu?: boolean;
}

export default function Header(props: HeaderProps) {
  const { hideMenu } = props;

  const [shoppingCart, setShoppingCart] = useRecoilState(shoppingCartState);

  return (
    <>
      <div className='flex flex-row items-center content-center justify-between m-5'>
        <div className='navbar-start'>
          {!hideMenu && (
            <div className='dropdown'>

              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Bars3Icon className='w-6 h-6' />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>              <BookTypeMenu />
                  </DropdownMenuLabel>

                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
        <div className='navbar-center'>
          <Link href='/' className='btn btn-ghost normal-case text-xl'>
            Bookstore
          </Link>
        </div>
        <div className='navbar-end'>
          <Link href='/cart' className='btn btn-ghost btn-circle'>
            <div className='flex flex-row'>
              <ShoppingCartIcon className='w-6 h-6' />
              <span className='badge badge-sm indicator-item'>
                {calcCartItemSum(shoppingCart)}
              </span>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}