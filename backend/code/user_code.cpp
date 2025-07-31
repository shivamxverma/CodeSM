#include <string>
#include <iostream>
using namespace std;

int main(){
  int n;cin>>n;
  long long sum = 0;
  for(int i=0 ; i<n ; i++){
    int x;cin>>x;
    sum += (x%2==0?x:0);
  }

  cout << sum << endl;
}
