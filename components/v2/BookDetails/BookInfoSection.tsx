import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  useRecoilState,
  useRecoilValue,
  useRecoilValueLoadable,
  useSetRecoilState,
} from 'recoil';
import { HomeIcon, BookmarkIcon } from '@heroicons/react/24/outline';

import { bookInfoQuery, bookRatingQuery } from 'selectors';
import { BookDetailProps, BookRatingsProps, starLabels } from 'const';
import { currencyFormat, roundHalf } from 'lib/utils';
import BookInfoDialog from 'components/v2/BookDetails/BookInfoDialog';
import { Button } from '../ui/button';
import { useState } from 'react';
import { getAnswer, getCache, getCacheLocal } from 'lib/aiqns';
import { Book } from '@prisma/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';

export default function BookInfoSection() {
  const [bookDetailsState, setBookDetailsState] = React.useState<
    BookDetailProps | undefined
  >();
  const editBookDetailDialogRef = React.useRef<HTMLDialogElement>(null);
  const [qnsAnsOutput, setQnsAnsOutput] = useState<string[]>([]);
  const [qnsList, setQnsList] = useState<string[]>([]);

  const bookDetailsLodable = useRecoilValueLoadable(bookInfoQuery);

  const handleUpdate = (data: BookDetailProps) => {
    setBookDetailsState(data);
  };

  switch (bookDetailsLodable.state) {
    case 'hasValue':
      const data = bookDetailsLodable.contents.content;
      const qnsInputKeyEnter = async (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== 'Enter') return;
        const qns = (document.getElementById('ai_qns_Input') as HTMLInputElement).value;
        const noAns = "There is no answer. We will try to ask the community for you."
        const ans = await getAnswer(qns, data as unknown as Book, {
          qnsans: [],
          id: 0,
          bookId: 0
        }, noAns);
        setQnsAnsOutput([...qnsAnsOutput, qns, ans]);
      }

      const ansInputKeyEnter = async (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== 'Enter') return;
        const ans = (document.getElementById('ai_ans_Input') as HTMLInputElement).value;
        const cache = getCacheLocal();
        // im dying
      }
      return (
        <>
          <div className='text-sm breadcrumbs'>
            <ul>
              <li>
                <Link href='/'>
                  <HomeIcon className='w-4 h-4' />
                  Book
                </Link>
              </li>
              <li>
                <BookmarkIcon className='w-4 h-4' />
                {data.title}
              </li>
            </ul>
          </div>

          <div className=' m-5 p-5 h-auto justify-start shadow-xl rounded-box'>
            <div className='hero-content flex-col lg:flex-row'>
              <Image
                src={`https://picsum.photos/seed/${data.id}/200/280`}
                alt={`book image`}
                width={200}
                height={280}
              />
              <div className='flex flex-col gap-2'>
                <h1 className='text-5xl font-bold'>{data.title}</h1>
                <p className='pt-6'>
                  <span className='text-lg font-bold pr-4'>Type:</span>
                  {data.type.replaceAll(`_nbsp_`, ` `).replaceAll(`_amp_`, `&`)}
                </p>
                <p>
                  <span className='text-lg font-bold pr-4'>
                    Publication date:
                  </span>
                  {new Date(data.publishedAt).toLocaleDateString()}
                </p>
                <p>
                  <span className='text-lg font-bold pr-4'>Price:</span>
                  {`$ ${currencyFormat(data.price)}`}
                </p>
                <p>
                  <span className='text-lg font-bold pr-4'>In stock:</span>
                  {bookDetailsState?.stock || data.stock}
                </p>
                <div className="flex flex-wrap gap-5">
                <Button
                  className='btn btn-info w-32'
                  onClick={() => {
                    editBookDetailDialogRef.current?.showModal();
                  }}
                >
                  Edit Details
                </Button>

                <Dialog>
                <DialogTrigger>
                  <Button>
                  Chat with AI

                  </Button>
                    
                </DialogTrigger>
                  <DialogContent className="modal-box">
                    <DialogHeader>
                    Chat with AI

                    </DialogHeader>
                    <DialogDescription>
                      {qnsAnsOutput.map((text) => (
                        <p key={text}>{text}</p>
                      ))}</DialogDescription>
                    <Input type="text" id="ai_qns_Input" placeholder="Chat now" className="Input Input-bordered Input-sm w-full max-w-xs" onKeyUp={qnsInputKeyEnter} />
                  </DialogContent>
                </Dialog>

                <Dialog>
                <DialogTrigger>
                  <Button>
                    Answer Questions
                  </Button>
                </DialogTrigger>
                  <DialogContent className="modal-box">
                    <DialogHeader className="font-bold text-lg">Answer Questions</DialogHeader>
                    <DialogDescription className="py-4">Press ESC key or click outside to close</DialogDescription>
                    <Input type="text" id="ai_ans_Input" placeholder="Chat now" className="Input Input-bordered Input-sm w-full max-w-xs" onKeyUp={ansInputKeyEnter} />
                  </DialogContent>
                </Dialog>
                </div>
                
              </div>
            </div>
          </div>

          {data && (
            <BookInfoDialog
              key={`${data.id}-${data.stock}`}
              id='edit_book_detail'
              ref={editBookDetailDialogRef}
              data={data}
              onSuccess={handleUpdate}
            />
          )}
        </>
      );
    case 'loading':
      return (
        <>
          <div className='flex items-center justify-center'>
            <span className='loading loading-bars loading-lg'></span>
          </div>
        </>
      );
    case 'hasError':
      throw bookDetailsLodable.contents;
  }
}