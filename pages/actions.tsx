import { Button } from 'components/v2/ui/button';
import { useState } from 'react';

export default function AI() {
  const [generation, setGeneration] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);

    const response = await fetch('/api/completion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: 'What advice do you have for a bookstore admin?',
      }),
    });

    const json = await response.json();
    setGeneration(json.text);
    setIsLoading(false);
  };

  return (
    <div>
      <Button onClick={handleClick}>
        Generate AI advice
      </Button>

      {isLoading ? 'Loading...' : generation}
    </div>
  );
}
